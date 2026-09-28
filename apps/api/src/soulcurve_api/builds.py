"""Top player item builds per hero.

Will be replaced with real deadlock-api build data in M4; for now it generates
deterministic mock builds per hero (stable across requests) drawn from the
overall item pool in stats.py.
"""

import hashlib

import httpx
from fastapi import APIRouter, HTTPException

from soulcurve_api import deadlock_client
from soulcurve_api.models import Build, HeroBuildsResponse
from soulcurve_api.stats import _MOCK_ITEMS, MOCK_PATCH, RANKS

router = APIRouter()

BUILD_ITEM_COUNT = 4
BUILDS_PER_HERO = 3

# Fictional handles for mock build authorship, until deadlock-api exposes a builds endpoint.
_MOCK_BUILD_AUTHORS = [
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


def _mock_builds(hero_id: int, rank: str | None) -> list[Build]:
    builds = []
    for i in range(BUILDS_PER_HERO):
        seed = int(hashlib.sha256(f"build:{hero_id}:{i}".encode()).hexdigest(), 16)
        item_pool = list(_MOCK_ITEMS)
        picked = []
        for slot in range(BUILD_ITEM_COUNT):
            index = (seed >> (slot * 8)) % len(item_pool)
            picked.append(item_pool.pop(index).name)
        win_rate = 0.64 - i * 0.035 - (seed % 100) / 5000
        if rank:
            key = f"build-rank:{rank}:{hero_id}:{i}"
            rank_seed = int(hashlib.sha256(key.encode()).hexdigest(), 16)
            win_rate += ((rank_seed % 800) - 400) / 10000  # +/-4pp
        builds.append(
            Build(
                build_id=hero_id * 10 + i,
                author=_MOCK_BUILD_AUTHORS[(hero_id + i * 3) % len(_MOCK_BUILD_AUTHORS)],
                items=picked,
                win_rate=round(min(0.85, max(0.3, win_rate)), 3),
                games=200 - i * 40 + (seed % 50),
            )
        )
    return sorted(builds, key=lambda b: b.win_rate, reverse=True)


@router.get("/api/stats/heroes/{hero_id}/builds")
async def hero_builds(hero_id: int, rank: str | None = None) -> HeroBuildsResponse:
    if rank is not None and rank not in RANKS:
        raise HTTPException(status_code=422, detail="Unknown rank")
    try:
        hero_names = await deadlock_client.fetch_heroes()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="deadlock-api unavailable") from exc
    hero_name = hero_names.get(hero_id)
    if hero_name is None:
        raise HTTPException(status_code=404, detail="Hero not found")
    return HeroBuildsResponse(
        patch=MOCK_PATCH,
        hero_id=hero_id,
        hero_name=hero_name,
        rank=rank,
        builds=_mock_builds(hero_id, rank),
    )
