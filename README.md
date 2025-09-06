# todo-app
# TODO App Monorepo

Single CLI executable orchestrating modes: CLI (default), Web (web), and MCP (mcp). Core logic and types shared across packages.

Quick start

1) Install deps and build
	- pnpm install
	- pnpm -r build

2) Use CLI
	- List: node packages/cli/bin/todo-app list --json
	- Add: node packages/cli/bin/todo-app add -t "My Task" -d "desc" -p high
	- Update: node packages/cli/bin/todo-app update -i <id> -c true
	- Delete: node packages/cli/bin/todo-app delete -i <id>

3) Start WebSocket server (web mode)
	- node packages/cli/bin/todo-app web --port 8080

4) Start MCP stdio server (mcp mode)
	- node packages/cli/bin/todo-app mcp

Packages

- packages/shared: Shared types
- packages/backend: SQLite + WebSocket server + services
- packages/cli: CLI orchestrator
- packages/mcp: MCP stdio server

Documentation

- docs/vision.md
- docs/product_backlog.md
- docs/design.md
- docs/execution_log.md
- docs/qa_plan.md
- docs/governance_traceability.md

Testing

- Backend unit tests (Vitest): pnpm -F @todo-app/backend test

Quick start

1. Read the project vision and design in `docs/vision.md` and `docs/design.md`.
2. See the product backlog and execution plan in `docs/product_backlog.md` and `docs/execution_log.md`.
3. Run tests (if present) under `tests/`.

Docs

- `docs/vision.md` — product vision
- `docs/design.md` — design details
- `docs/product_backlog.md` — backlog and in-flight items
- `docs/execution_log.md` — execution notes and gating decisions
- `docs/qa_plan.md` — QA plan and acceptance criteria
- `docs/governance_traceability.md` — governance traceability matrix and audit notes

Repository hygiene

- `src/` — application source (placeholder)
- `tests/` — tests (placeholder)

If anything in the DoD is missing, see `docs/governance_traceability.md` for current gaps and owners.
