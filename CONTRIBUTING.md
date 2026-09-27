# Contributing Guide

SoulCurve is a two-person team: **A (Gün)** builds the app, **B (Deniz)** builds
data/model. These rules are the same in both repos.

## Work tracking
- Every piece of work is an **issue**, tied to a **milestone** (M0-M5, see
  [ROADMAP](https://github.com/SoulCurve/soulcurve-model/blob/main/docs/ROADMAP.md)).
- Labels: `data`, `model`, `api`, `web`, `infra`, `docs`, `bug`, `phase-2`.
- Work labeled `phase-2` is not started until the Phase 1 gate is passed.

## Branch and commit
- `main` is protected; no direct pushes.
- Branch name: `<type>/<issue-no>-<short-description>`, e.g. `feat/12-snapshot-features`.
- Commit message in [Conventional Commits](https://www.conventionalcommits.org/) format:
  `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...`, `refactor: ...`, `test: ...`.

## Pull request
- Keep it small: one topic, preferably under 400 lines.
- The PR description fills out the template and links the related issue with `Closes #N`.
- **Every PR is reviewed by the other person** (A reviews B's, B reviews A's). No merge
  without at least 1 approval + green CI.
- Merge method: **squash merge**.
- If review doesn't happen within 24 hours, the PR owner sends a reminder. For an urgent
  fix the owner may merge, with review done afterward.

## Definition of "done"
- The code was run and its output read. "Should work" is not done.
- Tests and lint are green.
- If behavior or a decision changed, the relevant doc (docs/) was updated in the same PR.
- For model changes, metrics are given as before/after in the PR description.

## Code conventions
- The Python environment is managed with **uv**; global `pip` is not used.
- Library APIs are not written from memory; they're verified against current docs
  (Context7).
- Frontend packages in `apps/web` are managed with a single package manager (npm);
  the lockfile is committed.

## Secrets
- API keys, tokens, etc. **never** go into the repo. Locally: `.env` (gitignored);
  in CI: GitHub Actions secrets. `.env.example` lists the required variables with
  placeholder values.
