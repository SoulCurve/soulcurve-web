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
        yield
    deadlock_client._cache.clear()
