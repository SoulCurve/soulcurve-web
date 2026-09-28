"""Breakable crate ("box") routes on the schematic map.

Crates sit in the alleys between lanes and in the underground tunnel. Most
spawn at 3:00 and respawn 3 minutes after breaking; tunnel crates spawn at
5:00 and respawn after 5 (deadlock.wiki/Crates). Positions here are schematic
(same 0-1 space as the match map) until real map coordinates land in M4.

Each team's route starts and ends at its base and visits every crate on its
half. The order is exact (Held-Karp over the ~10 crates), and it is compared
against the greedy "go to the nearest crate next" route players tend to run.
"""

from functools import lru_cache
from math import hypot

from fastapi import APIRouter

from soulcurve_api.models import BoxRoute, BoxRouteResponse, BoxRouteStop, Crate

router = APIRouter()

# Seconds to cross the full schematic map (1.0 units) at base move speed.
SECONDS_PER_UNIT = 60
BREAK_SECONDS = 2

BASES = {"amber": (0.5, 0.95), "sapphire": (0.5, 0.05)}

# Amber half (y > 0.5); sapphire's half mirrors it across the river.
_AMBER_CRATES: list[tuple[float, float, str]] = [
    (0.12, 0.66, "alley"),
    (0.30, 0.60, "alley"),
    (0.33, 0.71, "alley"),
    (0.36, 0.83, "alley"),
    (0.64, 0.81, "alley"),
    (0.67, 0.69, "alley"),
    (0.88, 0.73, "alley"),
    (0.60, 0.56, "tunnel"),
    (0.66, 0.58, "tunnel"),
    (0.72, 0.55, "tunnel"),
]


def _crates() -> list[Crate]:
    crates = []
    for team_index, mirror in enumerate((False, True)):
        for i, (x, y, area) in enumerate(_AMBER_CRATES):
            timer = 5.0 if area == "tunnel" else 3.0
            crates.append(
                Crate(
                    id=team_index * 100 + i + 1,
                    x=x,
                    y=round(1 - y, 2) if mirror else y,
                    area=area,
                    spawn_min=timer,
                    respawn_min=timer,
                )
            )
    return crates


CRATES = _crates()


def _dist(a: tuple[float, float], b: tuple[float, float]) -> float:
    return hypot(a[0] - b[0], a[1] - b[1])


def _loop_length(base: tuple[float, float], points: list[tuple[float, float]]) -> float:
    path = [base, *points, base]
    return sum(_dist(p, q) for p, q in zip(path, path[1:], strict=False))


def _greedy_order(base: tuple[float, float], points: list[tuple[float, float]]) -> list[int]:
    left = set(range(len(points)))
    order, here = [], base
    while left:
        nxt = min(left, key=lambda i: _dist(here, points[i]))
        order.append(nxt)
        left.remove(nxt)
        here = points[nxt]
    return order


def _optimal_order(base: tuple[float, float], points: list[tuple[float, float]]) -> list[int]:
    """Held-Karp: shortest base -> every crate -> base loop."""
    n = len(points)
    full = (1 << n) - 1
    # best[(mask, last)] = (cost, previous) for paths from base covering mask, ending at last.
    best: dict[tuple[int, int], tuple[float, int]] = {
        (1 << i, i): (_dist(base, points[i]), -1) for i in range(n)
    }
    for mask in range(1, full + 1):
        for last in range(n):
            if (mask, last) not in best:
                continue
            cost = best[(mask, last)][0]
            for nxt in range(n):
                if mask & (1 << nxt):
                    continue
                key = (mask | (1 << nxt), nxt)
                candidate = cost + _dist(points[last], points[nxt])
                if key not in best or candidate < best[key][0]:
                    best[key] = (candidate, last)
    last = min(range(n), key=lambda i: best[(full, i)][0] + _dist(points[i], base))
    order, mask = [], full
    while last != -1:
        order.append(last)
        prev = best[(mask, last)][1]
        mask ^= 1 << last
        last = prev
    return order[::-1]


def _seconds(length: float, stops: int) -> int:
    return round(length * SECONDS_PER_UNIT + stops * BREAK_SECONDS)


def _route(team: str) -> BoxRoute:
    base = BASES[team]
    own = [c for c in CRATES if (c.y > 0.5) == (team == "amber")]
    points = [(c.x, c.y) for c in own]
    order = _optimal_order(base, points)
    greedy = _greedy_order(base, points)

    stops, here, elapsed = [], base, 0.0
    for position, i in enumerate(order, start=1):
        elapsed += _dist(here, points[i]) * SECONDS_PER_UNIT + BREAK_SECONDS
        here = points[i]
        stops.append(
            BoxRouteStop(
                order=position,
                crate_id=own[i].id,
                x=own[i].x,
                y=own[i].y,
                arrive_s=round(elapsed),
            )
        )
    return BoxRoute(
        team=team,
        stops=stops,
        loop_seconds=_seconds(_loop_length(base, [points[i] for i in order]), len(points)),
        naive_loop_seconds=_seconds(_loop_length(base, [points[i] for i in greedy]), len(points)),
    )


@lru_cache(maxsize=1)
def _response() -> BoxRouteResponse:
    return BoxRouteResponse(crates=CRATES, routes=[_route("amber"), _route("sapphire")])


@router.get("/api/map/box-routes")
def box_routes() -> BoxRouteResponse:
    return _response()
