"""Response şemaları.

docs/ARCHITECTURE.md'deki API sözleşmesiyle senkron tutulur.
"""

from typing import Literal

from pydantic import BaseModel


class WinProbabilityPoint(BaseModel):
    t_min: float
    p_win: float


class MatchEvent(BaseModel):
    t_min: float
    type: str
    detail: str
    team: str


class WinProbabilityResponse(BaseModel):
    match_id: int
    model_version: str
    team_perspective: Literal["amber", "sapphire"]
    points: list[WinProbabilityPoint]
    events: list[MatchEvent]
    winner: Literal["amber", "sapphire"]
