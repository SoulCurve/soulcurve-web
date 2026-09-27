"""FastAPI app entrypoint.

M4'te eklenecek: /api/matches/{match_id}/win-probability ve /api/model
(bkz. docs/ARCHITECTURE.md). Şimdilik yalnızca sağlık kontrolü var.
"""

from fastapi import FastAPI

from soulcurve_api import __version__

app = FastAPI(title="SoulCurve API", version=__version__)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "version": __version__}
