"""Top player item builds per hero.

Will be replaced with real deadlock-api build data in M4; for now it generates
deterministic mock builds per hero (stable across requests) drawn from the
overall item pool in stats.py.
"""

import hashlib

from fastapi import APIRouter, HTTPException

from soulcurve_api.models import Build, HeroBuildsResponse
from soulcurve_api.players import _LEADERBOARD_NAMES
from soulcurve_api.stats import _MOCK_HEROES, _MOCK_ITEMS, MOCK_PATCH

router = APIRouter()

BUILD_ITEM_COUNT = 4
BUILDS_PER_HERO = 3


def _mock_builds(hero_id: int) -> list[Build]:
    builds = []
    for i in range(BUILDS_PER_HERO):
        seed = int(hashlib.sha256(f"build:{hero_id}:{i}".encode()).hexdigest(), 16)
        item_pool = list(_MOCK_ITEMS)
        picked = []
        for slot in range(BUILD_ITEM_COUNT):
            index = (seed >> (slot * 8)) % len(item_pool)
            picked.append(item_pool.pop(index).name)
        builds.append(
            Build(
                build_id=hero_id * 10 + i,
                author=_LEADERBOARD_NAMES[(hero_id + i * 3) % len(_LEADERBOARD_NAMES)],
                items=picked,
                win_rate=round(0.64 - i * 0.035 - (seed % 100) / 5000, 3),
                games=200 - i * 40 + (seed % 50),
            )
        )
    return sorted(builds, key=lambda b: b.win_rate, reverse=True)


@router.get("/api/stats/heroes/{hero_id}/builds")
def hero_builds(hero_id: int) -> HeroBuildsResponse:
    hero = next((h for h in _MOCK_HEROES if h.hero_id == hero_id), None)
    if hero is None:
        raise HTTPException(status_code=404, detail="Hero not found")
    return HeroBuildsResponse(
        patch=MOCK_PATCH,
        hero_id=hero.hero_id,
        hero_name=hero.name,
        builds=_mock_builds(hero_id),
    )
