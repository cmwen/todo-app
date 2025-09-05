# QA Plan

This QA plan documents acceptance criteria, test scenarios, regression risks, and documentation verification for the release. It is authored to satisfy the QA Agent prompt requirements.

## Acceptance criteria (mapped to Vision)

1. Real-time todo creation/updates across clients — acceptance: creating a todo in one client is reflected to others (covered by integration/E2E). [Vision → Frontend/Backend]
2. Persistent data storage for release scope: for now the system uses in-memory DB; acceptance: backend health endpoint responds with 200. (smoke test)
3. Optimistic updates with rollback — acceptance: UI shows optimistic state and rolls back on server error (manual/E2E).
4. Type safety across packages — acceptance: shared types validate sample payloads (unit test)

## Minimal automated tests (this milestone)

- Backend smoke test: GET /health returns 200 (packages/backend/tests/smoke/health.test.ts)
- Shared unit test: validate Todo type parsing/validation using shared helpers (packages/shared/tests/unit/todo-types.test.ts)

## Test scenarios (happy path + edge cases)

- Happy: create todo → server returns created object with id and timestamps.
- Edge: create todo with missing title → server returns an error (validation).
- Edge: update non-existent todo → server returns 404 or error.
- Edge: simultaneous updates → last-write-wins (document expected behavior in technical-design).

## Regression risks

- No automated tests present for critical paths — risk increased. Mitigation: add smoke tests and CI gating.
- Shared types drift between packages — mitigate with unit tests and type-check CI.

## Documentation verification checklist

- `docs/vision.md` — present ✅
- `docs/product_backlog.md` — MISSING ❌ (Product owner must add)
- `docs/design.md` — present ✅
- `docs/execution_log.md` — MISSING ❌ (Execution owner to maintain)
- `docs/qa_plan.md` — present ✅
- `docs/governance_traceability.md` — present ✅

If any of the above are missing, the release should be blocked unless a waiver is recorded in `docs/governance_traceability.md`.

## Test runner & quick commands

This repo uses Jest for minimal tests. From the repo root:

```bash
pnpm install
pnpm test
```

## Reporting & labels

- Use labels for findings: `[QA → Execution: Bug]`, `[QA → Design: Flaw]`, `[QA → Governance]`.
- Log issues in GitHub referencing the failing test and the acceptance criteria mapping.

## Owner & cadence

- QA owner: TBD
- Run smoke tests on each PR and nightly full test suite.
