"""Thin client for api.deadlock-api.com, with a small in-process TTL cache.

No API key needed (public tier, 200 req/min per IP). Cache keeps repeat
requests for the same query well under that.
"""

import time
from typing import Any

import httpx

BASE_URL = "https://api.deadlock-api.com"
_HERO_STATS_TTL_S = 300
_HEROES_TTL_S = 3600

_cache: dict[tuple, tuple[float, Any]] = {}


async def _get(path: str, params: dict, ttl_s: float) -> Any:
    key = (path, tuple(sorted(params.items())))
    cached = _cache.get(key)
    if cached and cached[0] > time.monotonic():
        return cached[1]
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        response = await client.get(path, params=params)
        response.raise_for_status()
        data = response.json()
    _cache[key] = (time.monotonic() + ttl_s, data)
    return data


async def fetch_hero_stats(
    min_badge: int | None = None, max_badge: int | None = None
) -> list[dict]:
    params: dict = {}
    if min_badge is not None:
        params["min_average_badge"] = min_badge
    if max_badge is not None:
        params["max_average_badge"] = max_badge
    return await _get("/v1/analytics/hero-stats", params, _HERO_STATS_TTL_S)


async def fetch_heroes() -> dict[int, str]:
    """Active, player-selectable heroes, keyed by hero_id."""
    heroes = await _get("/v1/assets/heroes", {"only_active": "true"}, _HEROES_TTL_S)
    return {
        h["id"]: h["name"] for h in heroes if h.get("player_selectable") and not h.get("disabled")
    }


async def fetch_items() -> dict[int, str]:
    """Purchasable shop upgrade items (weapon/vitality/spirit), keyed by item_id."""
    items = await _get("/v1/assets/items/by-type/upgrade", {}, _HEROES_TTL_S)
    return {i["id"]: i["name"] for i in items if i.get("shopable")}


async def fetch_match_history(account_id: int) -> list[dict]:
    return await _get(f"/v1/players/{account_id}/match-history", {}, _HERO_STATS_TTL_S)


async def fetch_rank(account_id: int) -> dict:
    return await _get(f"/v1/players/{account_id}/rank", {}, _HERO_STATS_TTL_S)


async def fetch_item_stats(
    hero_id: int, min_badge: int | None = None, max_badge: int | None = None
) -> list[dict]:
    params: dict = {"hero_id": hero_id}
    if min_badge is not None:
        params["min_average_badge"] = min_badge
    if max_badge is not None:
        params["max_average_badge"] = max_badge
    return await _get("/v1/analytics/item-stats", params, _HERO_STATS_TTL_S)


async def fetch_leaderboard(region: str) -> list[dict]:
    return (await _get(f"/v1/leaderboard/{region}", {}, _HERO_STATS_TTL_S))["entries"]


async def steam_search(name: str, limit: int = 15) -> list[dict]:
    """Resolve a persona name to Steam profiles, best match first."""
    try:
        return await _get(
            "/v1/players/steam-search", {"search_query": name, "limit": limit}, _HERO_STATS_TTL_S
        )
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 404:
            return []
        raise
