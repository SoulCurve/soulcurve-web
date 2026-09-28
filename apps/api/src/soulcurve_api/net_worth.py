"""Team net worth over a match.

Follows the same fixed curve as the mock win probability in main.py so the two
charts agree: amber's souls lead grows as its win chance climbs. Real
per-minute net worth comes from deadlock-api's match data in M4.
"""

from fastapi import APIRouter

from soulcurve_api.models import NetWorthPoint, NetWorthResponse

router = APIRouter()

# (t_min, amber win probability), identical to the win-probability points in main.py.
_CURVE = [(0, 0.5), (3, 0.55), (7.5, 0.62), (12, 0.58), (18, 0.71), (24, 0.83), (29, 0.91)]

STARTING_SOULS = 600
SOULS_PER_MIN = 1400  # per team


def _points() -> list[NetWorthPoint]:
    points = []
    for t_min, p_win in _CURVE:
        total = 2 * (STARTING_SOULS + SOULS_PER_MIN * t_min)
        # The souls gap is a muted echo of the win-probability gap.
        amber = round(total * (0.5 + (p_win - 0.5) * 0.5))
        points.append(NetWorthPoint(t_min=t_min, amber=amber, sapphire=round(total) - amber))
    return points


@router.get("/api/matches/{match_id}/net-worth")
def net_worth(match_id: int) -> NetWorthResponse:
    return NetWorthResponse(match_id=match_id, points=_points())
