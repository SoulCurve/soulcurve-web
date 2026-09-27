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


class HeroStat(BaseModel):
    hero_id: int
    name: str
    win_rate: float
    pick_rate: float


class HeroStatsResponse(BaseModel):
    patch: str
    heroes: list[HeroStat]


class ItemStat(BaseModel):
    item_id: int
    name: str
    win_rate: float
    pick_rate: float


class HeroItemStatsResponse(BaseModel):
    patch: str
    hero_id: int
    hero_name: str
    items: list[ItemStat]
