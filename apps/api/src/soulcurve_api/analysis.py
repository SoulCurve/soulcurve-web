"""Per-match player coaching analysis (WPA-style action valuation).

Mistake score: 10 minus a weighted penalty for moments that dropped the
player's win probability (Xenopoulos, "Valuing Player Actions in CS:GO",
arXiv 2011.01324, is the reference framework this generalizes). Positive
moments are shown for context but don't add points back — the score is
meant to flag weaknesses, not net them against good plays.

Will be replaced with real per-player WPA once deadlock-api match_player
data is wired up (M4); for now it returns fixed/mock data shaped like the
real contract.
"""

from fastapi import APIRouter, HTTPException

from soulcurve_api.models import MatchAnalysisResponse, PlayerMoment

router = APIRouter()

MISTAKE_PENALTY_WEIGHT = 50.0

_MOCK_MOMENTS: list[PlayerMoment] = [
    PlayerMoment(
        t_min=5,
        type="rotation",
        description="Missed the rotation to defend the lane Guardian",
        wpa_delta=-0.03,
    ),
    PlayerMoment(
        t_min=12,
        type="death",
        description="Died alone to a 2-man gank near mid",
        wpa_delta=-0.07,
    ),
    PlayerMoment(
        t_min=18,
        type="objective_win",
        description="Secured the enemy Guardian solo",
        wpa_delta=0.09,
    ),
    PlayerMoment(
        t_min=24,
        type="good_trade",
        description="Traded evenly in a team fight before taking the Walker",
        wpa_delta=0.05,
    ),
]


def _score(moments: list[PlayerMoment]) -> float:
    penalty = sum(-m.wpa_delta for m in moments if m.wpa_delta < 0) * MISTAKE_PENALTY_WEIGHT
    return round(max(0.0, min(10.0, 10.0 - penalty)), 1)


@router.get("/api/matches/{match_id}/analysis")
def match_analysis(match_id: int) -> MatchAnalysisResponse:
    if match_id <= 0:
        raise HTTPException(status_code=404, detail="Match not found")
    return MatchAnalysisResponse(
        match_id=match_id,
        player_id="mock-player",
        hero_name="Abrams",
        score=_score(_MOCK_MOMENTS),
        summary=(
            "Two rotation/positioning mistakes cost the early lead; "
            "strong play in the second half made up ground."
        ),
        moments=_MOCK_MOMENTS,
    )
