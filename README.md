# soulcurve-web

SoulCurve's application repo: a dashboard showing a Deadlock match's **win probability
curve** over time. Backend and frontend live in this single repo (monorepo).

The model and feature computation are produced by the
[`soulcurve-model`](https://github.com/SoulCurve/soulcurve-model) repo. The roadmap is
kept there: [ROADMAP.md](https://github.com/SoulCurve/soulcurve-model/blob/main/docs/ROADMAP.md).

## Structure

```
apps/
  api/    FastAPI (Python, uv): fetches match data, runs the model, returns JSON
  web/    React + Vite (TypeScript): dashboard UI
docs/
  ARCHITECTURE.md   components, API contract, deploy
  DECISIONS.md      architectural decisions taken and their rationale
```

## Docs

| File | Content |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | API endpoints, model loading, frontend pages, deploy |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Why monorepo, why FastAPI + React, open decisions |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Two-person workflow, branch/PR rules |

## Quick start

```bash
# API
cd apps/api
uv sync
uv run fastapi dev src/soulcurve_api/main.py   # http://localhost:8000/health
uv run pytest

# Web (after initial setup, see apps/web/README.md)
cd apps/web
npm install
npm run dev
```

## Phase status

**Phase 1: MVP dashboard.** Win probability curve only. Accounts, payments and coaching
(Phase 2) will not be added until the model is validated and deadlock-api's commercial
terms are clarified.
