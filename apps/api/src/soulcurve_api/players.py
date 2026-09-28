"""Player match history.

Will be replaced with real deadlock-api match history in M4; for now it
generates deterministic mock matches per steam_id (stable across requests
and reloads) so the frontend has something realistic to page through.
"""

import hashlib
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter

from soulcurve_api.models import (
    LeaderboardPlayer,
    LeaderboardResponse,
    MatchSummary,
    PlayerGrade,
    PlayerMatchesResponse,
    PlayerProfileResponse,
    PlayerTendency,
)
from soulcurve_api.stats import _MOCK_HEROES

router = APIRouter()

MATCH_HISTORY_LENGTH = 10


def _mock_matches(steam_id: str) -> list[MatchSummary]:
    now = datetime.now(UTC)
    matches = []
    for i in range(MATCH_HISTORY_LENGTH):
        seed = int(hashlib.sha256(f"{steam_id}:{i}".encode()).hexdigest(), 16)
        hero = _MOCK_HEROES[seed % len(_MOCK_HEROES)]
        matches.append(
            MatchSummary(
                match_id=1000 + (seed % 9000),
                hero_id=hero.hero_id,
                hero_name=hero.name,
                result="win" if seed % 2 == 0 else "loss",
                kills=seed % 15,
                deaths=(seed // 15) % 12,
                assists=(seed // 180) % 20,
                duration_min=22 + (seed % 25),
                played_at=(now - timedelta(hours=i * 7 + (seed % 5))).date().isoformat(),
            )
        )
    return matches


@router.get("/api/players/{steam_id}/matches")
def player_matches(steam_id: str) -> PlayerMatchesResponse:
    names = {p.steam_id: p.name for p in leaderboard().players}
    return PlayerMatchesResponse(
        steam_id=steam_id, name=names.get(steam_id), matches=_mock_matches(steam_id)
    )


LEADERBOARD_SIZE = 10

# Fictional handles until deadlock-api's leaderboard lands in M4.
_LEADERBOARD_NAMES = [
    "vexlight",
    "Morrow",
    "kiln",
    "saltpeter",
    "Juno_ttv",
    "halfcourt",
    "Ossuary",
    "reddeer",
    "tallow",
    "Pilgrim",
]


@router.get("/api/leaderboard")
def leaderboard() -> LeaderboardResponse:
    players = []
    for i, name in enumerate(_LEADERBOARD_NAMES[:LEADERBOARD_SIZE]):
        seed = int(hashlib.sha256(f"leaderboard:{name}".encode()).hexdigest(), 16)
        players.append(
            LeaderboardPlayer(
                position=i + 1,
                steam_id=str(76561198000000000 + seed % 100_000_000),
                name=name,
                rank="Eternus" if i < 6 else "Ascendant",
                rating=4200 - i * 37 - seed % 20,
                win_rate=round(0.58 + (seed % 90) / 1000 - i * 0.004, 3),
                matches=180 + seed % 420,
                top_hero=_MOCK_HEROES[seed % len(_MOCK_HEROES)].name,
            )
        )
    return LeaderboardResponse(region="Global", players=players)


# Categories graded 0-1, in the spirit of Deadlock Labs' role grade and Mobalytics' GPI.
_GRADE_CATEGORIES = ["Laning", "Farming", "Teamfighting", "Objectives"]
_GRADE_BANDS = [(0.85, "S"), (0.7, "A"), (0.55, "B"), (0.4, "C"), (0.25, "D")]

# One line per category for each tone; shown when that category is the player's best or worst.
_TENDENCY_COPY = {
    "Laning": (
        "Wins the lane",
        "Ahead on souls at 10 minutes in most games",
        "Falls behind in lane",
        "Often trails on souls by 10 minutes",
    ),
    "Farming": (
        "Efficient farmer",
        "Clears jungle camps and crates quickly between fights",
        "Leaves souls on the map",
        "Misses camps and crates that are up",
    ),
    "Teamfighting": (
        "Strong in team fights",
        "Survives and trades well when both teams commit",
        "Dies early in fights",
        "Often the first one down when fights start",
    ),
    "Objectives": (
        "Pushes objectives",
        "Turns won fights into Guardians and Walkers",
        "Slow to take objectives",
        "Wins fights but rarely converts them into objectives",
    ),
}


def _seed(key: str) -> int:
    return int(hashlib.sha256(key.encode()).hexdigest(), 16)


def _letter(score: float) -> str:
    return next((letter for floor, letter in _GRADE_BANDS if score >= floor), "F")


@router.get("/api/players/{steam_id}/profile")
def player_profile(steam_id: str) -> PlayerProfileResponse:
    # ponytail: rating is seeded per player; the real estimate comes from match results in M4.
    # Leaderboard players keep their leaderboard rating so the two pages agree.
    ratings = {p.steam_id: p.rating for p in leaderboard().players}
    rating = ratings.get(steam_id, 1200 + _seed(f"rating:{steam_id}") % 2800)
    percentile = round(min(0.999, (rating - 1200) / 3000), 3)

    # Grades lean on the rating so a top player doesn't show a wall of Ds, plus per-category noise.
    grades = []
    for category in _GRADE_CATEGORIES:
        noise = (_seed(f"grade:{steam_id}:{category}") % 1000) / 1000
        score = round(min(0.98, 0.15 + 0.55 * percentile + 0.3 * noise), 3)
        grades.append(PlayerGrade(category=category, letter=_letter(score), score=score))

    # Only call something a strength at B or better, and a weakness at C or worse.
    tendencies = []
    best = max(grades, key=lambda g: g.score)
    if best.score >= 0.55:
        label, detail, _, _ = _TENDENCY_COPY[best.category]
        tendencies.append(PlayerTendency(label=label, detail=detail, tone="strength"))
    worst = min(grades, key=lambda g: g.score)
    if worst.score < 0.55:
        _, _, label, detail = _TENDENCY_COPY[worst.category]
        tendencies.append(PlayerTendency(label=label, detail=detail, tone="weakness"))

    return PlayerProfileResponse(
        steam_id=steam_id,
        skill_rating=rating,
        skill_percentile=percentile,
        grades=grades,
        tendencies=tendencies,
    )
