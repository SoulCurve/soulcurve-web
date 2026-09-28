"""Match map: where kills happened and which objectives fell when.

Coordinates are normalized to a schematic map (0-1 on both axes): amber's base
at the bottom, sapphire's at the top, three lanes at x = 0.2 / 0.5 / 0.8. Real
positions come from deadlock-api's match data in M4; until then kills are
seeded per match, and objectives follow the same fixed timeline as the mock
win-probability curve so the two views agree.
"""

import hashlib

from fastapi import APIRouter

from soulcurve_api.models import MapKill, MapObjective, MatchMapResponse

router = APIRouter()

MATCH_LENGTH_MIN = 29
KILL_COUNT = 36
LANE_X = {"left": 0.2, "middle": 0.5, "right": 0.8}

# (name, lane, owner, y, destroyed_at) -- matches the win-probability events.
_OBJECTIVES = [
    ("Guardian", "left", "amber", 0.62, 7.5),
    ("Guardian", "middle", "amber", 0.62, None),
    ("Guardian", "right", "amber", 0.62, None),
    ("Walker", "left", "amber", 0.78, None),
    ("Walker", "middle", "amber", 0.78, None),
    ("Walker", "right", "amber", 0.78, None),
    ("Patron", "middle", "amber", 0.92, None),
    ("Guardian", "left", "sapphire", 0.38, None),
    ("Guardian", "middle", "sapphire", 0.38, 18),
    ("Guardian", "right", "sapphire", 0.38, None),
    ("Walker", "left", "sapphire", 0.22, None),
    ("Walker", "middle", "sapphire", 0.22, 24),
    ("Walker", "right", "sapphire", 0.22, None),
    ("Patron", "middle", "sapphire", 0.08, MATCH_LENGTH_MIN),
]


def _unit(seed: int, salt: int) -> float:
    return ((seed >> (salt * 12)) % 4096) / 4096


def _kills(match_id: int) -> list[MapKill]:
    kills = []
    for i in range(KILL_COUNT):
        seed = int(hashlib.sha256(f"map:{match_id}:{i}".encode()).hexdigest(), 16)
        t = round(MATCH_LENGTH_MIN * (i + _unit(seed, 0)) / KILL_COUNT, 2)
        lane = list(LANE_X)[seed % 3]
        # Fights drift toward sapphire's base as amber takes over the game.
        front = 0.5 - 0.3 * (t / MATCH_LENGTH_MIN)
        y = min(0.9, max(0.1, front + (_unit(seed, 1) - 0.5) * 0.35))
        x = min(0.95, max(0.05, LANE_X[lane] + (_unit(seed, 2) - 0.5) * 0.14))
        team = "amber" if _unit(seed, 3) < 0.45 + 0.3 * (t / MATCH_LENGTH_MIN) else "sapphire"
        kills.append(MapKill(t_min=t, x=round(x, 3), y=round(y, 3), team=team))
    return kills


@router.get("/api/matches/{match_id}/map")
def match_map(match_id: int) -> MatchMapResponse:
    return MatchMapResponse(
        match_id=match_id,
        kills=_kills(match_id),
        objectives=[
            MapObjective(name=name, lane=lane, owner=owner, x=LANE_X[lane], y=y, destroyed_at=at)
            for name, lane, owner, y, at in _OBJECTIVES
        ],
    )
