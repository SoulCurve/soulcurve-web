"""Player match history, profile, and leaderboard.

Match history, rank/skill, and the leaderboard are live from deadlock-api.com,
keyed off the player's Steam64 id converted to a Deadlock account_id.
Per-category grades are still hybrid (real percentile, synthetic breakdown)
pending further integration.
"""

import asyncio
import hashlib
from datetime import UTC, datetime

import httpx
from fastapi import APIRouter, HTTPException

from soulcurve_api import deadlock_client
from soulcurve_api.models import (
    LeaderboardPlayer,
    LeaderboardResponse,
    MatchSummary,
    PlayerGrade,
    PlayerMatchesResponse,
    PlayerProfileResponse,
    PlayerTendency,
)
from soulcurve_api.stats import RANKS

router = APIRouter()

MATCH_HISTORY_LENGTH = 10

# Steam64 -> Steam32 (Deadlock's account_id) offset.
STEAM64_ACCOUNT_ID_OFFSET = 76561197960265728


def _account_id(steam_id: str) -> int:
    try:
        return int(steam_id) - STEAM64_ACCOUNT_ID_OFFSET
    except ValueError as exc:
        raise HTTPException(status_code=422, detail="Invalid Steam ID") from exc


@router.get("/api/players/{steam_id}/matches")
async def player_matches(steam_id: str) -> PlayerMatchesResponse:
    try:
        rows, hero_names = await asyncio.gather(
            deadlock_client.fetch_match_history(_account_id(steam_id)),
            deadlock_client.fetch_heroes(),
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="deadlock-api unavailable") from exc

    matches = [
        MatchSummary(
            match_id=row["match_id"],
            hero_id=row["hero_id"],
            hero_name=hero_names.get(row["hero_id"], "Unknown"),
            result="win" if row["player_team"] == row["match_result"] else "loss",
            kills=row["player_kills"],
            deaths=row["player_deaths"],
            assists=row["player_assists"],
            duration_min=round(row["match_duration_s"] / 60),
            played_at=datetime.fromtimestamp(row["start_time"], tz=UTC).date().isoformat(),
        )
        for row in rows[:MATCH_HISTORY_LENGTH]
    ]
    board = await leaderboard()
    names = {p.steam_id: p.name for p in board.players}
    return PlayerMatchesResponse(steam_id=steam_id, name=names.get(steam_id), matches=matches)


LEADERBOARD_SIZE = 10
LEADERBOARD_REGION = "NAmerica"


async def _resolve_account_id(name: str, possible_account_ids: list[int]) -> int:
    """Disambiguate a leaderboard name to one account_id.

    Most names have a single candidate already. When several accounts share
    the name, steam-search's ranked results (string similarity + recent
    activity) usually surface the right one; we only trust a hit that's also
    among deadlock-api's own candidates for that leaderboard spot.
    """
    if len(possible_account_ids) == 1:
        return possible_account_ids[0]
    candidates = set(possible_account_ids)
    for profile in await deadlock_client.steam_search(name):
        if profile["account_id"] in candidates:
            return profile["account_id"]
    return possible_account_ids[0]


async def _leaderboard_player(
    position: int, entry: dict, hero_names: dict[int, str]
) -> LeaderboardPlayer:
    account_id = await _resolve_account_id(entry["account_name"], entry["possible_account_ids"])
    rank_data, matches = await asyncio.gather(
        deadlock_client.fetch_rank(account_id),
        deadlock_client.fetch_match_history(account_id),
    )
    badge = rank_data.get("badge") or 0
    wins = sum(1 for m in matches if m["player_team"] == m["match_result"])
    top_hero_ids = entry.get("top_hero_ids") or []
    return LeaderboardPlayer(
        position=position,
        steam_id=str(account_id + STEAM64_ACCOUNT_ID_OFFSET),
        name=entry["account_name"],
        rank=RANKS[min(badge // 10, len(RANKS) - 1)],
        rating=1000 + badge * 30,
        win_rate=round(wins / len(matches), 3) if matches else 0.0,
        matches=len(matches),
        top_hero=hero_names.get(top_hero_ids[0], "Unknown") if top_hero_ids else "Unknown",
    )


@router.get("/api/leaderboard")
async def leaderboard() -> LeaderboardResponse:
    try:
        entries, hero_names = await asyncio.gather(
            deadlock_client.fetch_leaderboard(LEADERBOARD_REGION),
            deadlock_client.fetch_heroes(),
        )
        # Some entries have no resolvable account at all; skip those and keep going.
        usable = [e for e in entries if e.get("possible_account_ids")][:LEADERBOARD_SIZE]
        players = await asyncio.gather(
            *(_leaderboard_player(i + 1, entry, hero_names) for i, entry in enumerate(usable))
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="deadlock-api unavailable") from exc
    return LeaderboardResponse(region=LEADERBOARD_REGION, players=list(players))


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


MAX_BADGE = 116  # highest tier (Eternus=11) * 10 + highest subrank (6)


@router.get("/api/players/{steam_id}/profile")
async def player_profile(steam_id: str) -> PlayerProfileResponse:
    try:
        rank_data = await deadlock_client.fetch_rank(_account_id(steam_id))
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="deadlock-api unavailable") from exc

    badge = rank_data.get("badge") or 0
    rating = 1000 + badge * 30
    percentile = round(min(0.999, badge / MAX_BADGE), 3)

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
