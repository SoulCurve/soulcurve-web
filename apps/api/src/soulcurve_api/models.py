"""Response schemas.

Kept in sync with the API contract in docs/ARCHITECTURE.md.
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
    rank: str | None = None
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


class ItemsResponse(BaseModel):
    patch: str
    items: list[ItemStat]


class PlayerMoment(BaseModel):
    t_min: float
    type: Literal["death", "objective_loss", "objective_win", "good_trade", "rotation"]
    description: str
    wpa_delta: float


class MatchAnalysisResponse(BaseModel):
    match_id: int
    player_id: str
    hero_name: str
    score: float
    summary: str
    moments: list[PlayerMoment]


class MatchSummary(BaseModel):
    match_id: int
    hero_id: int
    hero_name: str
    result: Literal["win", "loss"]
    kills: int
    deaths: int
    assists: int
    duration_min: int
    played_at: str


class PlayerMatchesResponse(BaseModel):
    steam_id: str
    matches: list[MatchSummary]


class NewsItem(BaseModel):
    id: int
    title: str
    date: str
    tag: Literal["patch-notes", "news"]
    summary: str


class NewsResponse(BaseModel):
    items: list[NewsItem]
