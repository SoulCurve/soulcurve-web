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

Every endpoint below is implemented and live. Real deadlock-api.com data integration has
started: `/api/stats/heroes` (and the hero identity used by `/items` and `/builds`) is now
live, sourced from `/v1/analytics/hero-stats` and `/v1/assets/heroes`, with rank filtering
via badge tier. Everything else still returns fixed/deterministic mock data — either static
or seeded deterministically (e.g. by steam_id or rank) so it looks plausible and is stable
across reloads, per `docs/DECISIONS.md` D2–D4 — pending further integration.

## API contract

| Endpoint | Description |
|---|---|
| `GET /health` | Liveness + API version |
| `GET /api/matches/{match_id}/win-probability` | The match's win-probability time series |
| `GET /api/matches/{match_id}/net-worth` | Per-team total souls over time, derived from the win-probability curve |
| `GET /api/matches/{match_id}/map` | Kill positions and objective states on a schematic map (normalized 0–1 coords) |
| `GET /api/matches/{match_id}/analysis` | Per-player WPA-style mistake analysis (0–10 score + flagged moments) |
| `GET /api/map/box-routes` | Breakable crate positions/timers and each team's optimal crate loop (exact shortest base-to-base order) vs. the greedy nearest-crate loop |
| `GET /api/leaderboard` | Top-rated players (mock, fictional handles until M4) |
| `GET /api/players/{steam_id}/matches` | A player's recent match history (hero, result, KDA, duration) — **live**, from deadlock-api's match-history, keyed by Steam64→account_id conversion |
| `GET /api/players/{steam_id}/profile` | Skill rating/percentile (live, from deadlock-api's badge/rank) and per-category (Laning/Farming/Teamfighting/Objectives) letter grades + tendencies (still derived/mock — deadlock-api's role-stats endpoint is Patreon-only) |
| `GET /api/stats/ranks` | The 12 Deadlock ranked tiers |
| `GET /api/stats/heroes?rank=` | Hero win/pick rates, optionally filtered by rank — **live**, from deadlock-api |
| `GET /api/stats/heroes/{hero_id}/items?rank=` | Item win/pick rates for a specific hero, optionally filtered by rank (hero identity live, item numbers still mock) |
| `GET /api/stats/items` | Overall item win/pick rates (all heroes) |
| `GET /api/stats/heroes/{hero_id}/builds` | Top-player item builds for a hero, ranked by win rate (hero identity live, builds still mock) |
| `GET /api/stats/patch-summary` | Biggest hero win-rate winners/losers vs. the previous patch |
| `GET /api/stats/rank-distribution` | Share of players at each of the 12 ranked tiers |
| `GET /api/model` | Model transparency: version, algorithm, metrics, input features (mock until M4) |
| `GET /api/blog` | Blog post list (summaries, no body) |
| `GET /api/blog/{slug}` | A single blog post, full body |
| `GET /api/tournaments` | Tournament/league list (mock, fictional teams) |
| `GET /api/tournaments/{slug}` | One tournament: standings derived from round-robin results, schedule |
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
   top players (leaderboard), latest blog posts, latest news/patch notes.
2. **Match (`/match/:matchId`):** win-probability curve (0–100%, 50% reference line),
   objective events on the timeline, result and model version. A replay bar (play/pause,
   restart, scrubber) steps through the match: the chart dims the future, and the win
   chance and objectives list update to the current moment. Client-side only, built on
   the win-probability response. Below it, a schematic match map (CSS 3D, drag to rotate,
   top-down toggle) shows kills and fallen objectives up to the replay's current moment.
   Kill positions are seeded mock data; deadlock-api has real position data for M4.
   A per-team toggle overlays the optimal box route: breakable crates (filled once spawned,
   3:00 in alleys, 5:00 in the tunnel) and the shortest loop through that team's crates,
   numbered, with how much faster it is than walking to the nearest crate each time.
   Crate positions are schematic until real map coordinates land.
3. **Match analysis (`/match/:matchId/analysis`):** per-player mistake score (0–10) and
   the WPA-flagged moments behind it — meant to keep growing with more cards/widgets
   over time, not a finished single-purpose page (see `docs/DECISIONS.md`).
4. **Player (`/player/:steamId`):** hero pool (games/win rate per hero, derived
   client-side from the match history) and a recent match history list, each row
   linking to that match's analysis.
5. **Stats (`/stats`):** hero win/pick rates (filterable by rank) with the item
   breakdown for the selected hero, a win-rate-derived S/A/B/C/D tier list, and a
   rank distribution chart showing the share of players at each ranked tier.
6. **Builds (`/builds`):** top-player item builds per hero, ranked by win rate.
7. **Model (`/model`):** transparency page — model version, algorithm, accuracy/AUC-ROC/log
   loss metrics, and the input features it looks at. All values are placeholders until
   the real model lands in M4; linked from the home page and the main nav.
8. **Blog (`/blog` list, `/blog/:slug` detail):** long-form posts explaining how SoulCurve
   works (mistake scoring, the tier list, why the site launched on mock data); linked
   from the main nav.
9. **Tournaments (`/tournaments` list, `/tournaments/:slug` detail):** live/upcoming/
   completed events with prize pool, standings and a per-round schedule. Mock events and
   fictional teams until a pro-match data source is chosen.
10. **Following (`/following`):** players you follow (Follow button on the player page),
   each with their last 5 results and win rate. Stored in the browser (`localStorage`)
   until accounts get server-side storage in Neon.
11. **News (`/news`):** patch-notes/news feed, plus a patch winners/losers summary
   (biggest hero win-rate swings vs. the previous patch) at the top.
12. **FAQ (`/faq`).**

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
