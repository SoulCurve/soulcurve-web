"""FastAPI app entrypoint.

To be added in M4: real deadlock-api data + model prediction (see docs/ARCHITECTURE.md).
`/api/matches/{match_id}/win-probability` currently returns fixed/mock data; the
contract (response schema) matches the real one, so the frontend can be developed
and tested before the model is wired up.
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from soulcurve_api import __version__
from soulcurve_api.analysis import router as analysis_router
from soulcurve_api.auth import router as auth_router
from soulcurve_api.blog import router as blog_router
from soulcurve_api.builds import router as builds_router
from soulcurve_api.model_info import router as model_info_router
from soulcurve_api.models import MatchEvent, WinProbabilityPoint, WinProbabilityResponse
from soulcurve_api.news import router as news_router
from soulcurve_api.players import router as players_router
from soulcurve_api.stats import router as stats_router
from soulcurve_api.tournaments import router as tournaments_router

app = FastAPI(title="SoulCurve API", version=__version__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("WEB_ORIGIN", "http://localhost:5173")],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(auth_router)
app.include_router(stats_router)
app.include_router(analysis_router)
app.include_router(news_router)
app.include_router(players_router)
app.include_router(builds_router)
app.include_router(model_info_router)
app.include_router(blog_router)
app.include_router(tournaments_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "version": __version__}


@app.get("/api/matches/{match_id}/win-probability")
def win_probability(match_id: int) -> WinProbabilityResponse:
    return WinProbabilityResponse(
        match_id=match_id,
        model_version="mock-v0",
        team_perspective="amber",
        points=[
            WinProbabilityPoint(t_min=0, p_win=0.5),
            WinProbabilityPoint(t_min=3, p_win=0.55),
            WinProbabilityPoint(t_min=7.5, p_win=0.62),
            WinProbabilityPoint(t_min=12, p_win=0.58),
            WinProbabilityPoint(t_min=18, p_win=0.71),
            WinProbabilityPoint(t_min=24, p_win=0.83),
            WinProbabilityPoint(t_min=29, p_win=0.91),
        ],
        events=[
            MatchEvent(t_min=7.5, type="objective", detail="Guardian", team="sapphire"),
            MatchEvent(t_min=18, type="objective", detail="Guardian", team="amber"),
            MatchEvent(t_min=24, type="objective", detail="Walker", team="amber"),
        ],
        winner="amber",
    )
