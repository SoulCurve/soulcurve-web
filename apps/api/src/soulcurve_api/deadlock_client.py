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
