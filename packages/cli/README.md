# @cmwen/todo-app

TODO App CLI - Single executable orchestrating multiple modes: CLI (default), Web UI, and MCP server. Core logic and types shared across packages.

## Installation

Install globally via npm:

```bash
npm install -g @cmwen/todo-app
```

## Quick Start

### CLI Mode (Default)
After installation, you can use the `todo-app` command directly:

```bash
# List todos (with JSON output)
todo-app list --json

# Add a new todo
todo-app add -t "My Task" -d "Task description" -p high

# Update a todo (mark as complete)
todo-app update -i <id> -c true

# Delete a todo
todo-app delete -i <id>

# Show help
todo-app --help
```

### Web UI Mode
Start both backend WebSocket server and Next.js frontend:

```bash
# Start web mode (opens browser automatically)
todo-app web --port 8080 --ui-port 3000
```

This starts:
- Backend WebSocket server on port 8080
- Next.js UI on port 3000
- Automatically opens your browser
- Passes NEXT_PUBLIC_WS_URL to the frontend

### MCP Server Mode
Start as a Model Context Protocol stdio server:

```bash
# Start MCP stdio server
todo-app mcp
```

## Features

- ✅ **CLI Mode**: Traditional command-line interface
- ✅ **Web Mode**: Modern web UI with real-time updates
- ✅ **MCP Mode**: Model Context Protocol server integration
- ✅ **Multi-mode**: Single executable, multiple interfaces
- ✅ **Real-time**: WebSocket-based live updates
- ✅ **Local Storage**: SQLite database
- ✅ **Shared Types**: Type-safe across all modes
- ✅ **Monorepo Architecture**: Modular design

## Architecture

This CLI package orchestrates the entire TODO app ecosystem:

- **packages/shared**: Shared TypeScript types
- **packages/backend**: SQLite + WebSocket server + services  
- **packages/cli**: CLI orchestrator (this package)
- **packages/frontend**: Next.js web UI
- **packages/mcp**: MCP stdio server

## Development

If you're contributing to the project:

```bash
# Clone and setup
git clone https://github.com/cmwen/todo-app
cd todo-app

# Install dependencies and build
pnpm install
pnpm -r build

# Run tests
pnpm -F @todo-app/backend test

# Development mode
pnpm dev
```

## Documentation

Comprehensive documentation available in the monorepo:

- [Project Vision](https://github.com/cmwen/todo-app/blob/main/docs/vision.md)
- [Design Details](https://github.com/cmwen/todo-app/blob/main/docs/design.md)
- [Product Backlog](https://github.com/cmwen/todo-app/blob/main/docs/product_backlog.md)
- [Execution Log](https://github.com/cmwen/todo-app/blob/main/docs/execution_log.md)
- [QA Plan](https://github.com/cmwen/todo-app/blob/main/docs/qa_plan.md)
- [Governance & Traceability](https://github.com/cmwen/todo-app/blob/main/docs/governance_traceability.md)

## Requirements

- Node.js 16 or higher

## License

MIT

## Repository

This package is part of the [todo-app](https://github.com/cmwen/todo-app) monorepo.
