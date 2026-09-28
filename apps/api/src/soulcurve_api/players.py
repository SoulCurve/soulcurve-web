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
    PlayerMatchesResponse,
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
    return PlayerMatchesResponse(steam_id=steam_id, matches=_mock_matches(steam_id))


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
