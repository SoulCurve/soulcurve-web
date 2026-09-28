"""Model transparency endpoint.

Was speced in docs/ARCHITECTURE.md's Phase 1 draft (`GET /api/model`) but never
built; this is that endpoint. Will be replaced with the real trained model's
metadata once soulcurve-model is wired up (M4) — for now it returns fixed mock
data shaped like the real contract (model version, training range, metrics).
"""

from fastapi import APIRouter

from soulcurve_api.models import ModelInfoResponse, ModelMetric

router = APIRouter()

_MOCK_MODEL_INFO = ModelInfoResponse(
    model_version="mock-v0",
    trained_at="2026-09-01",
    training_matches=0,
    training_patch_range="n/a (mock model)",
    algorithm="LightGBM (gradient-boosted trees)",
    metrics=[
        ModelMetric(
            label="Accuracy",
            value="—",
            description="Not yet measured — placeholder data until the real model is trained (M4).",
        ),
        ModelMetric(
            label="AUC-ROC",
            value="—",
            description="How well the model ranks a likely winner above a likely loser.",
        ),
        ModelMetric(
            label="Log loss",
            value="—",
            description="Penalizes confident wrong predictions more than uncertain ones.",
        ),
    ],
    features=[
        "Team net worth differential over time",
        "Hero levels and souls",
        "Objective (Guardian/Walker/Shrine) control",
        "Recent kill/death trades",
    ],
    summary=(
        "SoulCurve's win-probability curve comes from a model trained to predict, at "
        "every point in a match, which team is more likely to win the game. Every number "
        "on this page is a placeholder: the real model, trained on real Deadlock match "
        "data, lands in a later milestone (see docs/ARCHITECTURE.md). Until then, match "
        "pages show a fixed mock curve so the rest of the product can be built and used "
        "against a stable contract."
    ),
)


@router.get("/api/model")
def model_info() -> ModelInfoResponse:
    return _MOCK_MODEL_INFO
