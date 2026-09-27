# Architecture: soulcurve-web

## Components

```
 browser ──► apps/web (React + Vite, static build)
                 │  fetch /api/...
                 ▼
             apps/api (FastAPI)
                 │  1. fetches match data ──► api.deadlock-api.com (REST)
                 │  2. computes features ──► soulcurve_model.features (package)
                 │  3. predicts ──► LightGBM model (Release artifact)
                 ▼
             JSON: win probability series + events
```

## API contract (Phase 1 draft)

| Endpoint | Description |
|---|---|
| `GET /health` | Liveness + loaded model version |
| `GET /api/matches/{match_id}/win-probability` | The match's win-probability time series |
| `GET /api/model` | Model version, training range, metrics (for transparency) |

Example response (`win-probability`):

```json
{
  "match_id": 12345678,
  "model_version": "model-v0.1.0",
  "team_perspective": "amber",
  "points": [
    {"t_min": 0, "p_win": 0.51},
    {"t_min": 3, "p_win": 0.55}
  ],
  "events": [
    {"t_min": 7.5, "type": "objective", "detail": "Guardian", "team": "sapphire"}
  ],
  "winner": "amber"
}
```

The schema is read from the OpenAPI spec FastAPI generates. Frontend types are
generated from this schema (e.g. `openapi-typescript`), never hand-written. This keeps
both sides in sync in the same repo.

## Model loading

- API dependency: the `soulcurve-model` package, pinned to a git tag (see
  soulcurve-model/docs/ARCHITECTURE.md).
- Model file: downloaded on startup from the Release named by the `MODEL_VERSION`
  environment variable, and cached locally.
- On startup, the feature list in `metadata.json` is compared against the package's
  list; a mismatch prevents the API from starting (training/serving skew guard).

## Data fetching and caching

- Data for a single match comes from deadlock-api's REST endpoints. Which endpoint
  provides `match_player` snapshots will be verified against the OpenAPI schema in M4.
- Completed matches' data never changes, so results can be cached permanently
  (Phase 1: file/SQLite; Redis if needed).
- Rate limits are respected: a simple client-side limiter and retry.

## Frontend (Phase 1 pages)

1. **Home page:** search by match ID.
2. **Match page:** win-probability curve (0-100%, 50% reference line), objective
   events marked on the timeline, result and model version.

## Environment variables

Listed in `.env.example`; real values are provided locally via `.env` and in
deployed environments via the platform's secret management.

| Variable | Description |
|---|---|
| `MODEL_VERSION` | The model Release tag to use |
| `DEADLOCK_API_BASE_URL` | Defaults to `https://api.deadlock-api.com` |
| `CACHE_DIR` | Model and match cache directory |

## Deploy (decided in M4)

Proposal: frontend as a static build (Vercel / Netlify / Cloudflare Pages), API as a
single container (Fly.io / Render / Railway). Phase 1 traffic is low, so a free or
lowest tier is enough. The decision will be recorded in DECISIONS.md.

## CI

- `api` job: `uv sync --locked`, `ruff check`, `ruff format --check`, `pytest`.
- `web` job: added once the frontend is set up (`npm ci`, `npm run lint`, `npm run build`).
