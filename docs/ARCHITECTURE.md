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

## Current status (2026-09-28)

Every endpoint below is implemented and live, but **all of them return fixed/deterministic
mock data** (no live deadlock-api or model calls yet) — this is Phase 1, building the full
site shape against a stable contract before M4 wires up real data. Mock data is either
static or seeded deterministically (e.g. by steam_id or rank) so it looks plausible and is
stable across reloads, per `docs/DECISIONS.md` D2–D4.

## API contract

| Endpoint | Description |
|---|---|
| `GET /health` | Liveness + API version |
| `GET /api/matches/{match_id}/win-probability` | The match's win-probability time series |
| `GET /api/matches/{match_id}/analysis` | Per-player WPA-style mistake analysis (0–10 score + flagged moments) |
| `GET /api/players/{steam_id}/matches` | A player's recent match history (hero, result, KDA, duration) |
| `GET /api/stats/ranks` | The 12 Deadlock ranked tiers |
| `GET /api/stats/heroes?rank=` | Hero win/pick rates, optionally filtered by rank |
| `GET /api/stats/heroes/{hero_id}/items` | Item win/pick rates for a specific hero |
| `GET /api/stats/items` | Overall item win/pick rates (all heroes) |
| `GET /api/news` | News / patch-notes feed |
| `GET /api/me`, `GET /auth/steam/login`, `POST /auth/logout` | Steam OpenID session |

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

## Frontend pages

1. **Home (`/`):** player/match search bar, Steam sign-in, top heroes, top items,
   latest news/patch notes.
2. **Match (`/match/:matchId`):** win-probability curve (0–100%, 50% reference line),
   objective events on the timeline, result and model version.
3. **Match analysis (`/match/:matchId/analysis`):** per-player mistake score (0–10) and
   the WPA-flagged moments behind it — meant to keep growing with more cards/widgets
   over time, not a finished single-purpose page (see `docs/DECISIONS.md`).
4. **Player (`/player/:steamId`):** recent match history list, each row linking to
   that match's analysis.
5. **Stats (`/stats`):** hero win/pick rates (filterable by rank) with the item
   breakdown for the selected hero.
6. **News (`/news`) and FAQ (`/faq`).**

## Environment variables

Listed in `.env.example`; real values are provided locally via `.env` and in
deployed environments via the platform's secret management.

| Variable | Description |
|---|---|
| `MODEL_VERSION` | The model Release tag to use |
| `DEADLOCK_API_BASE_URL` | Defaults to `https://api.deadlock-api.com` |
| `CACHE_DIR` | Model and match cache directory |

## Deploy

Both apps are live on Vercel (see `docs/DECISIONS.md` D5):
- Frontend: `https://soulcurve-app.vercel.app`, git-linked to `docs/initial-scaffold`
  (auto-deploys on push).
- Backend: `https://soulcurve-api.vercel.app`, a Vercel Python function; not
  git-linked yet, so it needs a manual redeploy with the current source after backend
  changes (open item in DECISIONS.md).

## CI

- `api` job: `uv sync --locked`, `ruff check`, `ruff format --check`, `pytest`.
- `web` job: added once the frontend is set up (`npm ci`, `npm run lint`, `npm run build`).
