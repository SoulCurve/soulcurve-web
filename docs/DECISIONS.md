# Decisions

A short decision log. New decisions are appended at the bottom; if an old decision
changes, it isn't deleted — a "superseded by" note is added instead.

## D1: Two repos: `soulcurve-web` (monorepo) + `soulcurve-model`
**Date:** 2026-09-27 · **Status:** accepted

The initial proposal was three repos: frontend, backend and model. For a two-person,
early-stage project, splitting frontend from backend requires two separate CIs, two
separate versioning schemes, and cross-repo API contract synchronization — with no
offsetting benefit. Frontend and backend change together in the same change, so they
stay in one repo.

The model repo stays separate because its lifecycle differs: notebook exploration,
large local data, long training runs, and versioning independent of the web deploy.

## D2: Backend: FastAPI (Python)
**Date:** 2026-09-27 · **Status:** accepted

The model and feature code are in Python. If the API is also Python, feature
computation is called from the same package, eliminating the risk of
training/serving skew. FastAPI auto-generates the OpenAPI schema, so frontend types
can be generated from it.

## D3: Frontend: React + Vite (TypeScript)
**Date:** 2026-09-27 · **Status:** accepted (A may object)

Alternatives considered:
- **Streamlit / Dash:** the fastest path for Phase 1, but can't be the foundation for
  the Phase 2 product (accounts, premium, custom UI); would need a rewrite.
- **Next.js:** SSR/SEO isn't needed in Phase 1 and adds complexity. A migration path
  is open if needed in Phase 2.
- **React + Vite:** simple, static build, clean separation from FastAPI. Selected.

The charting library (e.g. Recharts, visx, ECharts) was left to A's preference.

## D4: Model distribution: GitHub Release + version-pinned package
**Date:** 2026-09-27 · **Status:** accepted

Details: soulcurve-model/docs/ARCHITECTURE.md. A model registry (MLflow, etc.) is
unnecessary for Phase 1; will be reconsidered if the need arises.

## Open decisions
- [ ] Deploy platform (before M4, owner: A)
- [ ] Cache layer: is file/SQLite enough (M4, owner: A)
- [ ] Phase 2: auth and payment provider (after the Phase 1 gate)
