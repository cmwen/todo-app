# @cmwen/todo-app

TODO App CLI - Single executable orchestrating multiple modes: CLI (default), Web UI, and MCP server. Core logic and types shared across packages.

## Installation

Install globally via npm:

```bash
npm install -g @cmwen/todo-app
```

## Quick Start

### @cmwen/todo-app - Bundled CLI

This is a self-contained, bundled command-line interface for the todo app. It's built using Vite and includes all dependencies except Node.js built-ins bundled into a single executable file.

## Features

- ✅ Single bundled executable file (~12KB gzipped)
- ✅ All workspace dependencies (@todo-app/*) bundled
- ✅ External npm dependencies kept as runtime dependencies
- ✅ Self-contained database schema (no external SQL files needed)
- ✅ Works from any directory
- ✅ Includes WebSocket server, MCP server, and CRUD operations

## Build & Development

```bash
# Build the bundled CLI
pnpm build

# Development (uses non-bundled version)
pnpm dev

# Clean build artifacts
pnpm clean
```

## Usage

Once built, the CLI is available at `dist/todo-app`:

```bash
# Add a todo
./dist/todo-app add -t "My task" -p high

# List todos  
./dist/todo-app list

# Update a todo as completed
./dist/todo-app update -i <todo-id> -c true

# Delete a todo
./dist/todo-app delete -i <todo-id>

# Start web server (backend + frontend)
./dist/todo-app web

# Start MCP server (limited functionality in bundled mode)
./dist/todo-app mcp

# Help
./dist/todo-app --help
```

## Publishing

The package is configured to publish to npm as `@cmwen/todo-app`. To publish:

```bash
# Ensure you're logged in to npm
npm login

# Publish (will run prepublishOnly script to build first)
pnpm publish
```

## Technical Details

- **Bundler**: Vite with Rollup
- **Target**: Node.js 18+ ES Modules
- **Bundle size**: ~388KB (~12KB gzipped)
- **External deps**: commander, pino, better-sqlite3, ws, zod, @modelcontextprotocol/sdk
- **Bundled**: All @todo-app workspace packages + their TypeScript sources

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
