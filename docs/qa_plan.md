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

---

Documentation Verification [QA → Governance]

- Present: docs/vision.md, docs/product_backlog.md, docs/design.md, docs/execution_log.md, docs/qa_plan.md, docs/governance_traceability.md.
- Cross-linking: design references product and execution; qa_plan references product and execution. Recommend adding quick links in README to all docs.
- .gitignore: Present at root with Node/SQLite/IDE/logs coverage; recommends confirming frontend ignores if/when frontend package is added.

Smoke Test Summary [QA → Execution]

- CLI CRUD: PASS — add/list/update/delete against SQLite.
- WS server start: PASS — server listens on :8090.
- MCP server module: PASS — startMCP export detected. Functional end-to-end with an MCP client not exercised here.

Edge Cases and Risks

- Schema assets not bundled to dist (backend resolves to source paths) — acceptable for local monorepo; for publish, copy assets or embed schema.
- No automated tests yet — add unit tests for TodoService and CLI golden tests.
- Concurrency/race tests not implemented — plan needed.

Next Steps

- Add unit tests (TodoService CRUD, error cases).
- Add CLI golden tests for --json outputs.
- Add MCP tool smoke test via stdio harness.
