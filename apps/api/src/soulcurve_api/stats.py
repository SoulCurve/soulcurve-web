"""General stats endpoints (hero/item win rates).

M4'te gerçek deadlock-api verisiyle değiştirilecek; şimdilik sabit/mock veri
döner, sözleşme gerçek olanla aynı kalacak şekilde tasarlandı.
"""

from fastapi import APIRouter, HTTPException

from soulcurve_api.models import HeroItemStatsResponse, HeroStat, HeroStatsResponse, ItemStat

router = APIRouter()

MOCK_PATCH = "mock-patch-1.0"

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

_MOCK_ITEMS_BY_HERO: dict[int, list[ItemStat]] = {
    hero.hero_id: [
        ItemStat(item_id=100 + i, name=name, win_rate=win_rate, pick_rate=pick_rate)
        for i, (name, win_rate, pick_rate) in enumerate(
            [
                ("Extra Health", 0.54, 0.62),
                ("Extra Stamina", 0.50, 0.41),
                ("Basic Magazine", 0.49, 0.55),
                ("Sprint Boots", 0.53, 0.38),
                ("Melee Lifesteal", 0.47, 0.22),
            ]
        )
    ]
    for hero in _MOCK_HEROES
}


@router.get("/api/stats/heroes")
def hero_stats() -> HeroStatsResponse:
    return HeroStatsResponse(patch=MOCK_PATCH, heroes=_MOCK_HEROES)


@router.get("/api/stats/heroes/{hero_id}/items")
def hero_item_stats(hero_id: int) -> HeroItemStatsResponse:
    hero = next((h for h in _MOCK_HEROES if h.hero_id == hero_id), None)
    if hero is None:
        raise HTTPException(status_code=404, detail="Hero not found")
    return HeroItemStatsResponse(
        patch=MOCK_PATCH,
        hero_id=hero.hero_id,
        hero_name=hero.name,
        items=_MOCK_ITEMS_BY_HERO[hero_id],
    )
