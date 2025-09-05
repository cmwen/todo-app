# TODO App Technical Design

## Project Structure

```
todo-app/
├── packages/
│   ├── frontend/                 # Next.js UI (App Router)
│   ├── backend/                  # WebSocket server + DB access
│   ├── shared/                   # Shared types, schemas, helpers
│   ├── cli/            (planned) # Bin + Commander.js
│   └── mcp/            (planned) # MCP stdio server
├── docs/
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

## Core Components

### 1. Data Models (shared)

```typescript
// todo.ts
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface TodoFilter {
  completed?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}
```

### 2. Repository Layer (backend)

```typescript
// base-repository.ts
export interface BaseRepository<T, CreateInput, UpdateInput> {
  create(input: CreateInput): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(filter?: any): Promise<T[]>;
  update(id: string, input: UpdateInput): Promise<T>;
  delete(id: string): Promise<void>;
}

// todo-repository.ts
export interface TodoRepository extends BaseRepository<Todo, CreateTodoInput, UpdateTodoInput> {
  findByFilter(filter: TodoFilter): Promise<Todo[]>;
  markAsCompleted(id: string): Promise<Todo>;
  markAsIncomplete(id: string): Promise<Todo>;
}
```

### 3. Service Layer (backend/shared)

```typescript
// todo-service.ts
export class TodoService {
  constructor(
    private todoRepository: TodoRepository,
    private validationService: ValidationService
  ) {}

  async createTodo(input: CreateTodoInput): Promise<Todo> {
    this.validationService.validateCreateTodo(input);
    return this.todoRepository.create(input);
  }

  async getTodos(filter?: TodoFilter): Promise<Todo[]> {
    return this.todoRepository.findByFilter(filter || {});
  }

  async getTodoById(id: string): Promise<Todo> {
    const todo = await this.todoRepository.findById(id);
    if (!todo) {
      throw new TodoNotFoundError(id);
    }
    return todo;
  }

  async updateTodo(id: string, input: UpdateTodoInput): Promise<Todo> {
    this.validationService.validateUpdateTodo(input);
    return this.todoRepository.update(id, input);
  }

  async deleteTodo(id: string): Promise<void> {
    await this.getTodoById(id); // Ensure exists
    return this.todoRepository.delete(id);
  }

  async markTodoCompleted(id: string): Promise<Todo> {
    return this.todoRepository.markAsCompleted(id);
  }

  async markTodoIncomplete(id: string): Promise<Todo> {
    return this.todoRepository.markAsIncomplete(id);
  }
}
```

## Interface Implementations

### 1. CLI Interface (planned `packages/cli`)

Commander.js commands
- `todo-app add "Buy" --description "Milk" [--priority high]`
- `todo-app list [--status pending|completed] [--json]`
- `todo-app edit <id> [--title ...] [--description ...] [--priority ...]`
- `todo-app complete <id>` / `uncomplete <id>`
- `todo-app delete <id>`
- Mode selection: `todo-app web [--port 3000]` and `todo-app mcp`

### 2. Web Interface (packages/frontend + packages/backend)

Express.js REST API with HTML frontend:

```
GET    /api/todos          # List todos
POST   /api/todos          # Create todo
GET    /api/todos/:id      # Get todo
PUT    /api/todos/:id      # Update todo
DELETE /api/todos/:id      # Delete todo
PATCH  /api/todos/:id/done # Mark done/undone
```

### 3. MCP Server (planned `packages/mcp`)

Tools
- `create_todo`, `list_todos`, `update_todo`, `delete_todo`, `toggle_todo_completion`
- Transport: stdio using `@modelcontextprotocol/sdk`

## Database Design

### Schema

```sql
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_created_at ON todos(created_at);
```

### Migration System (planned)

- Table `migrations(version TEXT PRIMARY KEY, applied_at DATETIME)`
- Apply SQL files from `packages/backend/src/database/migrations/*.sql` on startup
- Filenames: `YYYYMMDDHHmm_description.sql`
- Forward-only for this POC; add `down` later if needed

## Dependency Injection

Use a simple DI container to wire up dependencies:

```typescript
// src/shared/container.ts
export class Container {
  private services = new Map();

  register<T>(key: string, factory: () => T): void {
    this.services.set(key, factory);
  }

  get<T>(key: string): T {
    const factory = this.services.get(key);
    if (!factory) {
      throw new Error(`Service ${key} not found`);
    }
    return factory();
  }
}

// Usage in each interface (CLI/Web/MCP)
const container = new Container();
container.register('database', () => new Database(config.databasePath));
container.register('todoRepository', () => new SqliteTodoRepository(container.get('database')));
container.register('validationService', () => new ValidationService());
container.register('todoService', () => new TodoService(
  container.get('todoRepository'),
  container.get('validationService')
));
```

## Technology Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Database**: SQLite with better-sqlite3
- **CLI**: Commander.js (planned)
- **Web**: Express.js + EJS templates
- **MCP**: @modelcontextprotocol/sdk (planned)
- **Testing**: Jest
- **Build**: TypeScript compiler
- **Process Management**: PM2 (optional)
- **Containerization**: Docker

## Build & Deployment

### Scripts (package.json)

Root/package scripts (illustrative)
```json
{
  "scripts": {
    "build": "pnpm -r build",
    "dev": "pnpm -r --parallel dev",
    "dev:backend": "pnpm --filter @todo-app/backend dev",
    "dev:frontend": "pnpm --filter @todo-app/frontend dev",
    "test": "pnpm -r test",
    "type-check": "pnpm -r type-check",
    "migrate": "pnpm --filter @todo-app/backend migrate"
  }
}
```

### Docker Support

```dockerfile
# Multi-stage build for each interface
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS cli
# Copy built CLI (packages/cli/dist)
COPY dist/cli ./cli
COPY dist/backend ./backend
COPY dist/shared ./shared
ENTRYPOINT ["node", "cli/index.js"]

FROM base AS web
COPY dist/interfaces/web ./web
COPY dist/core ./core
COPY dist/shared ./shared
EXPOSE 3000
CMD ["node", "web/server.js"]

FROM base AS mcp
# Copy built MCP server (packages/mcp/dist)
COPY dist/mcp ./mcp
COPY dist/backend ./backend
COPY dist/shared ./shared
CMD ["node", "mcp/index.js"]
```

## Testing Strategy

### Unit Tests
- Core business logic (services, repositories)
- Validation logic
- Database operations

### Integration Tests
- API endpoints (web interface)
- CLI commands (planned)
- MCP tools (planned)
- Database migrations (planned)

### E2E Tests
- Full workflows across interfaces
- Data consistency between interfaces

## Development Workflow

1. **Core First**: Implement data models, repositories, and services
2. **Database Setup**: Create migrations and database layer
3. **CLI Interface**: Implement single bin and commands (default + web + mcp)
4. **Web Interface**: Orchestrate start via CLI `web`
5. **MCP Interface**: Implement MCP stdio server and wire to CLI `mcp`
6. **Testing**: Add comprehensive tests
7. **Documentation**: Complete API docs and examples

## Project structure & hygiene (Design → Product, Design → Execution)

- .gitignore: add SQLite db files (`data/*.db`, `*.db-journal`) and migration caches
- Packages to add: `packages/cli`, `packages/mcp`
- Docs to update: README usage for `npx todo-app`, `web`, `mcp`; API docs for MCP tools

## Backlog/Next steps mapping to Vision

1. Add `packages/cli` with bin and Commander.js (NPX compatible)
2. Implement CLI CRUD + `--json`; default mode
3. Wire `web` command to backend start; optional `--open`
4. Create `packages/mcp` with stdio tools; `mcp` command
5. Replace in-memory DB with SQLite + migrations
6. Tests across modes; E2E with shared DB

This design ensures clear separation of concerns while maximizing code reuse across all three interfaces.
