# Working Rules

Loaded every session (local and cloud). When work drifts from this, flag it in one line and offer the right step — don't just comply silently, and don't argue if the user says "skip".

## Always on

- Never write a library/framework API from memory — verify via Context7 (`.mcp.json` has it configured) before using an unfamiliar API.
- Never claim "done" without running the command and reading the output. If unverified, say so.
- ponytail is active: YAGNI, stdlib/existing deps first, shortest working diff.

## Skills installed in this repo (`.claude/skills/`)

| Skill | Use for |
|---|---|
| `grill-me`, `grilling` | Sharpening an ambiguous request or design before writing code |
| `brainstorming` | Exploring intent/requirements before implementation |
| `writing-plans` | Turning a spec into a plan file before multi-step work |
| `executing-plans` | Carrying out a written plan |
| `systematic-debugging` | Any bug/failure — diagnose before proposing a fix |
| `test-driven-development` | Feature/bugfix work — test first |
| `verification-before-completion` | Before claiming anything is done, fixed, or passing |
| `design-taste-frontend` | UI/frontend work — avoid generic/templated output |
| `web-design-guidelines` | Auditing UI against accessibility/UX rules |
| `ponytail` | Simplicity check on any code task |
| `i-have-adhd` | Output shaping: action-first, numbered steps, no tangents |
| `find-skills` | Discovering + installing a skill for a capability not covered here |

## Project discipline (durable, multi-step work only — skip for questions, quick edits, one-off scripts)

Stop, warn in one sentence, offer the step, act on confirmation. If told "skip", drop it and move on.

| Trigger | Action |
|---|---|
| Ambiguous request | Offer `grill-me` first |
| 3+ step task, no plan file | Offer to write one under `docs/plans/<feature>.md` (`writing-plans`) |
| New dependency being added | Check: would stdlib or an existing package do? |
| Hard-to-reverse decision (DB, framework, schema) | Offer to record it under `docs/adr/NNN-*.md` |
| Non-trivial logic, no check behind it | Leave one runnable check (test or `assert`-based entry point) |

Workflow when it applies: `grill-me` → `writing-plans` → `executing-plans` → `verification-before-completion`.

## Conventions

- Diagrams: mermaid inside markdown, never image files.
- Project-specific stack/domain rules (once the codebase has real content) belong in this file too — add a section here rather than starting a second rules file.

## Style

- Action first. No preamble, no closing recap.
- Number multi-step work; end with one concrete next step.
- If a test fails, show the output, don't soften it.
