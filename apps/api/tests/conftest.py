import pytest
import respx
from httpx import Response

from soulcurve_api import deadlock_client

MOCK_DL_HEROES = [
    {"id": 1, "name": "Infernus", "player_selectable": True, "disabled": False},
    {"id": 2, "name": "Seven", "player_selectable": True, "disabled": False},
    {"id": 3, "name": "Vindicta", "player_selectable": True, "disabled": False},
]

MOCK_DL_HERO_STATS = [
    {"hero_id": 1, "wins": 520, "losses": 480, "matches": 1000},
    {"hero_id": 2, "wins": 450, "losses": 550, "matches": 1000},
    {"hero_id": 3, "wins": 600, "losses": 400, "matches": 1000},
]

MOCK_DL_ITEMS = [
    {"id": 1001, "name": "Extra Health", "shopable": True},
    {"id": 1002, "name": "Extended Magazine", "shopable": True},
    {"id": 1003, "name": "Melee Lifesteal", "shopable": True},
    {"id": 1004, "name": "hidden_debug_item", "shopable": False},
]

MOCK_DL_ITEM_STATS = [
    {"item_id": 1001, "wins": 300, "losses": 200, "matches": 500},
    {"item_id": 1002, "wins": 150, "losses": 150, "matches": 300},
    {"item_id": 1003, "wins": 60, "losses": 40, "matches": 100},
    {"item_id": 1004, "wins": 5, "losses": 5, "matches": 10},
]


@pytest.fixture
def deadlock_api():
    """Mocks the deadlock-api.com endpoints stats/builds hit for hero data."""
    deadlock_client._cache.clear()
    with respx.mock(assert_all_called=False) as router:
        router.get("https://api.deadlock-api.com/v1/assets/heroes").mock(
            return_value=Response(200, json=MOCK_DL_HEROES)
        )
        router.get("https://api.deadlock-api.com/v1/analytics/hero-stats").mock(
            return_value=Response(200, json=MOCK_DL_HERO_STATS)
        )
        router.get("https://api.deadlock-api.com/v1/assets/items/by-type/upgrade").mock(
            return_value=Response(200, json=MOCK_DL_ITEMS)
        )
        router.get("https://api.deadlock-api.com/v1/analytics/item-stats").mock(
            return_value=Response(200, json=MOCK_DL_ITEM_STATS)
        )
        yield
    deadlock_client._cache.clear()
