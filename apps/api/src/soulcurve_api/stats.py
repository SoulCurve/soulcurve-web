"""General stats endpoints (hero/item win rates).

Hero stats are live from deadlock-api.com; item/build/patch stats are still
mock data pending further integration.
"""

import asyncio
import hashlib

import httpx
from fastapi import APIRouter, HTTPException

from soulcurve_api import deadlock_client
from soulcurve_api.models import (
    HeroItemStatsResponse,
    HeroStat,
    HeroStatsResponse,
    ItemsResponse,
    ItemStat,
    PatchChange,
    PatchSummaryResponse,
    RankDistributionResponse,
    RankShare,
)

router = APIRouter()

MOCK_PATCH = "mock-patch-1.0"
PREVIOUS_MOCK_PATCH = "mock-patch-0.9"
PATCH_SUMMARY_COUNT = 3

# Deadlock's ranked tiers (api.deadlock-api.com/v1/assets/ranks), low to high.
RANKS: list[str] = [
    "Obscurus",
    "Initiate",
    "Seeker",
    "Acolyte",
    "Sentinel",
    "Mystic",
    "Ritualist",
    "Emissary",
    "Oracle",
    "Phantom",
    "Ascendant",
    "Eternus",
]

# A rough bell curve over the 12 tiers, most players clustered in the middle
# ranks and long tails at Obscurus and Eternus, summing to 1.0.
_MOCK_RANK_SHARES: list[float] = [
    0.02,
    0.04,
    0.07,
    0.11,
    0.14,
    0.16,
    0.15,
    0.12,
    0.09,
    0.06,
    0.03,
    0.01,
]

_MOCK_HEROES: list[HeroStat] = [
    HeroStat(hero_id=1, name="Abrams", win_rate=0.52, pick_rate=0.18),
    HeroStat(hero_id=2, name="Bebop", win_rate=0.49, pick_rate=0.12),
    HeroStat(hero_id=3, name="Dynamo", win_rate=0.55, pick_rate=0.21),
    HeroStat(hero_id=4, name="Grey Talon", win_rate=0.47, pick_rate=0.15),
    HeroStat(hero_id=5, name="Haze", win_rate=0.51, pick_rate=0.24),
    HeroStat(hero_id=6, name="Infernus", win_rate=0.48, pick_rate=0.14),
    HeroStat(hero_id=7, name="Ivy", win_rate=0.53, pick_rate=0.17),
    HeroStat(hero_id=8, name="Vindicta", win_rate=0.46, pick_rate=0.11),
]


_MOCK_ITEMS: list[ItemStat] = [
    ItemStat(item_id=200 + i, name=name, win_rate=win_rate, pick_rate=pick_rate)
    for i, (name, win_rate, pick_rate) in enumerate(
        [
            ("Extra Health", 0.54, 0.62),
            ("Extra Stamina", 0.50, 0.41),
            ("Extended Magazine", 0.49, 0.55),
            ("Sprint Boots", 0.53, 0.38),
            ("Melee Lifesteal", 0.47, 0.22),
            ("Extra Regen", 0.51, 0.29),
            ("Restorative Shot", 0.56, 0.19),
            ("Mystic Shot", 0.45, 0.16),
            ("Healing Rite", 0.52, 0.33),
            ("Spirit Strike", 0.48, 0.14),
        ]
    )
]


def _badge_range(rank: str | None) -> tuple[int | None, int | None]:
    """Rank name -> deadlock-api badge tier range (tier*10 .. tier*10+9)."""
    if rank is None:
        return None, None
    tier = RANKS.index(rank)
    return tier * 10, tier * 10 + 9


@router.get("/api/stats/ranks")
def ranks() -> list[str]:
    return RANKS


@router.get("/api/stats/heroes")
async def hero_stats(rank: str | None = None) -> HeroStatsResponse:
    if rank is not None and rank not in RANKS:
        raise HTTPException(status_code=422, detail="Unknown rank")

    min_badge, max_badge = _badge_range(rank)

    try:
        raw_stats, hero_names = await asyncio.gather(
            deadlock_client.fetch_hero_stats(min_badge, max_badge),
            deadlock_client.fetch_heroes(),
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="deadlock-api unavailable") from exc

    total_matches = sum(row["matches"] for row in raw_stats if row["hero_id"] in hero_names)
    heroes = [
        HeroStat(
            hero_id=row["hero_id"],
            name=hero_names[row["hero_id"]],
            win_rate=round(row["wins"] / row["matches"], 3),
            pick_rate=round(row["matches"] / total_matches, 3),
        )
        for row in raw_stats
        if row["hero_id"] in hero_names and row["matches"] > 0
    ]
    return HeroStatsResponse(patch=MOCK_PATCH, rank=rank, heroes=heroes)


@router.get("/api/stats/patch-summary")
def patch_summary() -> PatchSummaryResponse:
    changes = []
    for hero in _MOCK_HEROES:
        seed = int(hashlib.sha256(f"patch-delta:{hero.hero_id}".encode()).hexdigest(), 16)
        delta = ((seed % 1200) - 600) / 10000  # +/-6pp
        previous = round(min(0.75, max(0.25, hero.win_rate - delta)), 3)
        changes.append(
            PatchChange(
                hero_id=hero.hero_id,
                name=hero.name,
                win_rate=hero.win_rate,
                previous_win_rate=previous,
                delta=round(hero.win_rate - previous, 3),
            )
        )
    ranked = sorted(changes, key=lambda c: c.delta, reverse=True)
    return PatchSummaryResponse(
        patch=MOCK_PATCH,
        previous_patch=PREVIOUS_MOCK_PATCH,
        winners=ranked[:PATCH_SUMMARY_COUNT],
        losers=ranked[-PATCH_SUMMARY_COUNT:][::-1],
    )


@router.get("/api/stats/rank-distribution")
def rank_distribution() -> RankDistributionResponse:
    return RankDistributionResponse(
        ranks=[
            RankShare(rank=rank, share=share)
            for rank, share in zip(RANKS, _MOCK_RANK_SHARES, strict=True)
        ]
    )


@router.get("/api/stats/items")
def item_stats() -> ItemsResponse:
    return ItemsResponse(patch=MOCK_PATCH, items=_MOCK_ITEMS)


ITEMS_PER_HERO = 12


@router.get("/api/stats/heroes/{hero_id}/items")
async def hero_item_stats(hero_id: int, rank: str | None = None) -> HeroItemStatsResponse:
    if rank is not None and rank not in RANKS:
        raise HTTPException(status_code=422, detail="Unknown rank")

    min_badge, max_badge = _badge_range(rank)

    try:
        hero_names, item_names, item_rows, hero_rows = await asyncio.gather(
            deadlock_client.fetch_heroes(),
            deadlock_client.fetch_items(),
            deadlock_client.fetch_item_stats(hero_id, min_badge, max_badge),
            deadlock_client.fetch_hero_stats(min_badge, max_badge),
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="deadlock-api unavailable") from exc

    hero_name = hero_names.get(hero_id)
    if hero_name is None:
        raise HTTPException(status_code=404, detail="Hero not found")

    hero_matches = next((row["matches"] for row in hero_rows if row["hero_id"] == hero_id), 0)
    items = [
        ItemStat(
            item_id=row["item_id"],
            name=item_names[row["item_id"]],
            win_rate=round(row["wins"] / row["matches"], 3),
            pick_rate=round(min(1.0, row["matches"] / hero_matches), 3),
        )
        for row in item_rows
        if row["item_id"] in item_names and row["matches"] > 0 and hero_matches
    ]
    items.sort(key=lambda i: i.pick_rate, reverse=True)
    return HeroItemStatsResponse(
        patch=MOCK_PATCH,
        hero_id=hero_id,
        hero_name=hero_name,
        items=items[:ITEMS_PER_HERO],
    )
