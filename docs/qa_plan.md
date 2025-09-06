# QA Plan

Purpose

Define acceptance criteria and testing approach for releases.

Acceptance criteria template

- ID: AC-001
- Description: Functionality behaves as specified in `docs/design.md`.
- Tests: unit + integration + manual acceptance steps.


Quick checklist

- Unit tests for new features (automated)
- Basic smoke tests for critical flows
- QA sign-off recorded in `docs/execution_log.md`

Acceptance criteria (examples linked from `docs/product_backlog.md`)

- T100 (Initialize .gitignore and base structure):
	- AC-100.1: `.gitignore` present and ignores OS/IDE/build artifacts.
	- AC-100.2: `src/`, `tests/`, `docs/` exist.
	- AC-100.3: README contains quick start and doc links.

- T101 (Governance docs skeleton):
	- AC-101.1: `docs/product_backlog.md`, `docs/execution_log.md`, `docs/qa_plan.md`, and `docs/governance_traceability.md` exist and cross-reference each other.

- T102 (CI & tests):
	- AC-102.1: CI workflow executes smoke test or unit tests.
	- AC-102.2: At least one unit test exists and passes in CI.

See `docs/product_backlog.md` for story-to-AC mapping and owners.
