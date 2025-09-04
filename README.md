# TODO App - Modern Pnpm Workspace

A modern TODO application built with pnpm workspace monorepo architecture, featuring Next.js 15 App Router with real-time WebSocket synchronization.

## Architecture Overview

```
todo-app/                          # Root workspace
├── packages/
│   ├── frontend/                  # Next.js 15 App Router with WebSocket
│   ├── backend/                   # WebSocket server with SQLite
│   └── shared/                    # Shared TypeScript types & utilities
├── docs/                          # Project documentation
└── pnpm-workspace.yaml           # Workspace configuration
```

## Tech Stack

- **Package Manager**: pnpm with workspaces
- **Frontend**: Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js WebSocket server, SQLite, better-sqlite3
- **Real-time**: WebSocket communication for live updates
- **Validation**: Zod schemas for type-safe data validation

## Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm 8+ (`npm install -g pnpm`)

### Installation

```bash
# Clone and install dependencies
git clone <repo-url> todo-app
cd todo-app
pnpm install

# Build shared package
pnpm --filter @todo-app/shared build
```

### Development

```bash
# Start all services in development mode
pnpm dev

# Or start services individually
pnpm dev:frontend  # Next.js on http://localhost:3000
pnpm dev:backend   # WebSocket server on ws://localhost:8080
```

### Production Build

```bash
# Build all packages
pnpm build

# Start production servers
pnpm start
```

## Features

- ✅ **Real-time synchronization** - Changes appear instantly across all connected clients
- ✅ **Modern UI** - Clean, responsive interface built with shadcn/ui components
- ✅ **Type Safety** - End-to-end TypeScript with shared types and Zod validation
- ✅ **Monorepo Architecture** - Clean separation with pnpm workspaces
- ✅ **Optimistic Updates** - Immediate UI feedback with conflict resolution
- ✅ **Auto-reconnection** - Robust WebSocket connection with exponential backoff

## Project Structure

### Frontend Package (`packages/frontend/`)
- Next.js 15 App Router application
- WebSocket client for real-time updates
- Tailwind CSS + shadcn/ui components
- Optimistic UI updates

### Backend Package (`packages/backend/`)
- WebSocket server handling client connections
- SQLite database with better-sqlite3
- Message validation and broadcasting
- RESTful fallback API (optional)

### Shared Package (`packages/shared/`)
- Common TypeScript interfaces and types
- Zod schemas for runtime validation
- Utility functions and helpers
- WebSocket message protocols

## Development Workflow

1. **Setup**: Initialize workspace and install dependencies
2. **Shared First**: Build shared types and utilities
3. **Backend**: Implement WebSocket server and database
4. **Frontend**: Create UI with WebSocket integration
5. **Testing**: End-to-end testing and validation

## API Documentation

### WebSocket Messages

All WebSocket communication uses JSON messages with this structure:

```typescript
interface WebSocketMessage {
  id: string;        // Unique message ID
  type: string;      // Message type
  payload: any;      // Message-specific data
  timestamp: number; // Client timestamp
}
```

### Client → Server Messages

- `create_todo` - Create a new todo item
- `update_todo` - Update existing todo
- `delete_todo` - Delete a todo item
- `list_todos` - Request todo list with filters

### Server → Client Messages

- `todo_created` - Broadcast new todo to all clients
- `todo_updated` - Broadcast todo update
- `todo_deleted` - Broadcast todo deletion
- `todos_listed` - Response to list_todos request
- `error` - Error message with details

## Scripts Reference

### Root Level Commands
```bash
pnpm dev              # Start all packages in development
pnpm build            # Build all packages
pnpm test             # Run tests across all packages
pnpm lint             # Lint all packages
pnpm type-check       # TypeScript check all packages
```

### Package-Specific Commands
```bash
pnpm dev:frontend     # Start Next.js dev server
pnpm dev:backend      # Start WebSocket server
pnpm build:frontend   # Build Next.js for production
pnpm build:backend    # Build backend for production
```

## Configuration

### Environment Variables

Create `.env.local` files in each package as needed:

**Frontend** (`packages/frontend/.env.local`):
```env
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

**Backend** (`packages/backend/.env`):
```env
PORT=8080
DATABASE_PATH=./data/todos.db
LOG_LEVEL=info
```

## Contributing

1. Follow the established monorepo structure
2. Ensure shared types are updated for any data model changes
3. Add appropriate TypeScript types and Zod schemas
4. Test WebSocket communication thoroughly
5. Update documentation for any new features

## Architecture Decisions

See [docs/design.md](./docs/design.md) for detailed technical design decisions and trade-offs.

## License

MIT License - see [LICENSE](./LICENSE) file for details.
