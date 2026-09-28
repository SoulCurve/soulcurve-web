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

MOCK_DL_MATCH_HISTORY = [
    {
        "match_id": 111,
        "hero_id": 1,
        "player_team": 0,
        "match_result": 0,
        "player_kills": 10,
        "player_deaths": 2,
        "player_assists": 5,
        "match_duration_s": 1200,
        "start_time": 1700000000,
    },
    {
        "match_id": 112,
        "hero_id": 2,
        "player_team": 1,
        "match_result": 0,
        "player_kills": 3,
        "player_deaths": 8,
        "player_assists": 2,
        "match_duration_s": 1500,
        "start_time": 1700003600,
    },
]

MOCK_DL_RANK = {"badge": 93, "rank": 9, "subrank": 3, "last_match": None}

MOCK_DL_LEADERBOARD = [
    {
        "account_name": f"Player{i}",
        "possible_account_ids": [5000 + i],
        "rank": i + 1,
        "top_hero_ids": [1],
    }
    for i in range(9)
] + [
    {
        "account_name": "Ambiguous",
        "possible_account_ids": [9001, 9002],
        "rank": 10,
        "top_hero_ids": [2],
    }
]

MOCK_DL_STEAM_SEARCH = [
    {
        "account_id": 9002,
        "personaname": "Ambiguous",
        "last_team_avg_badge": 50,
        "matches_played_last_30d": 20,
    }
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
        router.get(url__regex=r"https://api\.deadlock-api\.com/v1/players/\d+/match-history").mock(
            return_value=Response(200, json=MOCK_DL_MATCH_HISTORY)
        )
        router.get(url__regex=r"https://api\.deadlock-api\.com/v1/players/\d+/rank").mock(
            return_value=Response(200, json=MOCK_DL_RANK)
        )
        router.get(url__regex=r"https://api\.deadlock-api\.com/v1/leaderboard/\w+").mock(
            return_value=Response(200, json={"entries": MOCK_DL_LEADERBOARD})
        )
        router.get("https://api.deadlock-api.com/v1/players/steam-search").mock(
            return_value=Response(200, json=MOCK_DL_STEAM_SEARCH)
        )
        yield
    deadlock_client._cache.clear()
