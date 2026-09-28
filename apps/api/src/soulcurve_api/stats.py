"""General stats endpoints (hero/item win rates).

Will be replaced with real deadlock-api data in M4; for now it returns
fixed/mock data, designed so the contract matches the real one.
"""

import hashlib

from fastapi import APIRouter, HTTPException

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


def _rank_adjusted_heroes(rank: str) -> list[HeroStat]:
    """Deterministic per-rank variance for the mock heroes, so the filter visibly does something.

    Real rank-scoped win/pick rates arrive with the deadlock-api integration (M4);
    this just needs to look plausible and be stable for a given rank.
    """
    heroes = []
    for hero in _MOCK_HEROES:
        seed = int(hashlib.sha256(f"{rank}:{hero.hero_id}".encode()).hexdigest(), 16)
        win_delta = ((seed % 900) - 450) / 10000  # +/-4.5pp
        pick_delta = (((seed // 900) % 900) - 450) / 10000
        heroes.append(
            HeroStat(
                hero_id=hero.hero_id,
                name=hero.name,
                win_rate=round(min(0.75, max(0.25, hero.win_rate + win_delta)), 3),
                pick_rate=round(min(0.60, max(0.02, hero.pick_rate + pick_delta)), 3),
            )
        )
    return heroes


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

_MOCK_ITEMS_BY_HERO: dict[int, list[ItemStat]] = {
    hero.hero_id: [
        ItemStat(item_id=100 + i, name=name, win_rate=win_rate, pick_rate=pick_rate)
        for i, (name, win_rate, pick_rate) in enumerate(
            [
                ("Extra Health", 0.54, 0.62),
                ("Extra Stamina", 0.50, 0.41),
                ("Extended Magazine", 0.49, 0.55),
                ("Sprint Boots", 0.53, 0.38),
                ("Melee Lifesteal", 0.47, 0.22),
            ]
        )
    ]
    for hero in _MOCK_HEROES
}


@router.get("/api/stats/ranks")
def ranks() -> list[str]:
    return RANKS


@router.get("/api/stats/heroes")
def hero_stats(rank: str | None = None) -> HeroStatsResponse:
    if rank is not None and rank not in RANKS:
        raise HTTPException(status_code=422, detail="Unknown rank")
    heroes = _rank_adjusted_heroes(rank) if rank else _MOCK_HEROES
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


def _rank_adjusted_items(items: list[ItemStat], rank: str, hero_id: int) -> list[ItemStat]:
    """Same idea as _rank_adjusted_heroes: stable per-rank variance so the filter shows."""
    adjusted = []
    for item in items:
        seed = int(hashlib.sha256(f"{rank}:{hero_id}:{item.item_id}".encode()).hexdigest(), 16)
        win_delta = ((seed % 800) - 400) / 10000  # +/-4pp
        pick_delta = (((seed // 800) % 800) - 400) / 10000
        adjusted.append(
            ItemStat(
                item_id=item.item_id,
                name=item.name,
                win_rate=round(min(0.75, max(0.25, item.win_rate + win_delta)), 3),
                pick_rate=round(min(0.95, max(0.02, item.pick_rate + pick_delta)), 3),
            )
        )
    return adjusted


@router.get("/api/stats/heroes/{hero_id}/items")
def hero_item_stats(hero_id: int, rank: str | None = None) -> HeroItemStatsResponse:
    if rank is not None and rank not in RANKS:
        raise HTTPException(status_code=422, detail="Unknown rank")
    hero = next((h for h in _MOCK_HEROES if h.hero_id == hero_id), None)
    if hero is None:
        raise HTTPException(status_code=404, detail="Hero not found")
    items = _MOCK_ITEMS_BY_HERO[hero_id]
    return HeroItemStatsResponse(
        patch=MOCK_PATCH,
        hero_id=hero.hero_id,
        hero_name=hero.name,
        items=_rank_adjusted_items(items, rank, hero_id) if rank else items,
    )
