"""FastAPI app entrypoint.

M4'te eklenecek: gerçek deadlock-api verisi + model tahmini (bkz. docs/ARCHITECTURE.md).
`/api/matches/{match_id}/win-probability` şimdilik sabit/mock veri döner; sözleşme
(response şeması) gerçek olanla aynı, böylece frontend model bağlanmadan önce
geliştirilip test edilebilir.
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from soulcurve_api import __version__
from soulcurve_api.auth import router as auth_router
from soulcurve_api.models import MatchEvent, WinProbabilityPoint, WinProbabilityResponse

app = FastAPI(title="SoulCurve API", version=__version__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("WEB_ORIGIN", "http://localhost:5173")],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(auth_router)


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
