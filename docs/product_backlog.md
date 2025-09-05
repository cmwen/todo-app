# Product Backlog

This backlog is a prioritized list of work items derived from `docs/vision.md` and aligned to release goals. Use labels to map items to design docs and acceptance criteria.

[Vision → Product]

## Backlog (prioritized)

1. MVP: Stabilize current real-time sync (frontend + backend)
   - Owner: Engineering
   - Priority: High
   - Acceptance: Real-time creation/updates across clients, backend health OK. See `docs/qa_plan.md`.

2. Replace in-memory DB with SQLite and add migrations
   - Owner: Engineering
   - Priority: High
   - Acceptance: Migrations run, data persists across restarts.

3. Add `packages/cli` binary with `web` and `mcp` modes
   - Owner: Engineering
   - Priority: Medium
   - Acceptance: `npx todo-app web` starts server; `npx todo-app mcp` starts MCP stdio server.

4. Add authentication and multi-tenant support
   - Owner: Product/Engineering
   - Priority: Low

## Traceability notes

- Each backlog item should include a reference to the design doc (`docs/design.md` or `docs/technical-design.md`) and map to acceptance criteria in `docs/qa_plan.md`.
