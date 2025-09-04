# TODO App Technical Design

## Project Structure

```
todo-app/
├── src/
│   ├── core/                    # Core business logic (shared)
│   │   ├── models/              # Data models and types
│   │   │   ├── todo.ts
│   │   │   ├── index.ts
│   │   ├── repositories/        # Data access layer
│   │   │   ├── todo-repository.ts
│   │   │   ├── base-repository.ts
│   │   │   └── index.ts
│   │   ├── services/            # Business logic services
│   │   │   ├── todo-service.ts
│   │   │   ├── validation-service.ts
│   │   │   └── index.ts
│   │   ├── database/            # Database configuration
│   │   │   ├── connection.ts
│   │   │   ├── migrations/
│   │   │   └── index.ts
│   │   └── errors/              # Custom error types
│   │       ├── todo-errors.ts
│   │       └── index.ts
│   ├── interfaces/              # UI implementations
│   │   ├── cli/                 # Command line interface
│   │   │   ├── commands/
│   │   │   │   ├── add.ts
│   │   │   │   ├── list.ts
│   │   │   │   ├── edit.ts
│   │   │   │   ├── delete.ts
│   │   │   │   └── done.ts
│   │   │   ├── cli.ts
│   │   │   └── index.ts
│   │   ├── web/                 # Web application
│   │   │   ├── routes/
│   │   │   │   ├── todos.ts
│   │   │   │   └── index.ts
│   │   │   ├── middleware/
│   │   │   ├── public/          # Static files
│   │   │   ├── views/           # HTML templates
│   │   │   ├── app.ts
│   │   │   └── server.ts
│   │   └── mcp/                 # MCP server
│   │       ├── tools/
│   │       │   ├── todo-tools.ts
│   │       │   └── index.ts
│   │       ├── server.ts
│   │       └── index.ts
│   ├── shared/                  # Shared utilities
│   │   ├── logger.ts
│   │   ├── config.ts
│   │   └── utils.ts
│   └── types/                   # Shared type definitions
│       ├── common.ts
│       └── index.ts
├── tests/                       # Test files
│   ├── core/
│   ├── interfaces/
│   └── integration/
├── docs/                        # Documentation
├── database/                    # Database files
├── dist/                        # Compiled output
├── scripts/                     # Build and utility scripts
├── docker/                      # Docker configurations
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Core Components

### 1. Data Models (`src/core/models/`)

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

### 2. Repository Layer (`src/core/repositories/`)

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

### 3. Service Layer (`src/core/services/`)

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

### 1. CLI Interface (`src/interfaces/cli/`)

Uses Commander.js for command parsing:

```bash
# Commands
todo add "Buy groceries" --description "Milk, bread, eggs"
todo list --completed
todo edit 123 --title "Buy organic groceries"
todo done 123
todo delete 123
```

### 2. Web Interface (`src/interfaces/web/`)

Express.js REST API with HTML frontend:

```
GET    /api/todos          # List todos
POST   /api/todos          # Create todo
GET    /api/todos/:id      # Get todo
PUT    /api/todos/:id      # Update todo
DELETE /api/todos/:id      # Delete todo
PATCH  /api/todos/:id/done # Mark done/undone
```

### 3. MCP Server (`src/interfaces/mcp/`)

Model Context Protocol server with tools:

```json
{
  "tools": [
    {
      "name": "create_todo",
      "description": "Create a new todo item",
      "inputSchema": { ... }
    },
    {
      "name": "list_todos",
      "description": "List todo items with optional filtering",
      "inputSchema": { ... }
    },
    {
      "name": "update_todo",
      "description": "Update an existing todo item",
      "inputSchema": { ... }
    },
    {
      "name": "delete_todo",
      "description": "Delete a todo item",
      "inputSchema": { ... }
    },
    {
      "name": "toggle_todo_completion",
      "description": "Mark todo as done or undone",
      "inputSchema": { ... }
    }
  ]
}
```

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

### Migration System

```typescript
// Migration interface
export interface Migration {
  version: string;
  name: string;
  up(): Promise<void>;
  down(): Promise<void>;
}
```

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

// Usage in each interface
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
- **CLI**: Commander.js
- **Web**: Express.js + EJS templates
- **MCP**: @modelcontextprotocol/sdk
- **Testing**: Jest
- **Build**: TypeScript compiler
- **Process Management**: PM2 (optional)
- **Containerization**: Docker

## Build & Deployment

### Scripts (package.json)

```json
{
  "scripts": {
    "build": "tsc",
    "dev:cli": "ts-node src/interfaces/cli/index.ts",
    "dev:web": "ts-node src/interfaces/web/server.ts",
    "dev:mcp": "ts-node src/interfaces/mcp/index.ts",
    "start:cli": "node dist/interfaces/cli/index.js",
    "start:web": "node dist/interfaces/web/server.js",
    "start:mcp": "node dist/interfaces/mcp/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "migrate": "ts-node scripts/migrate.ts",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
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
COPY dist/interfaces/cli ./cli
COPY dist/core ./core
COPY dist/shared ./shared
ENTRYPOINT ["node", "cli/index.js"]

FROM base AS web
COPY dist/interfaces/web ./web
COPY dist/core ./core
COPY dist/shared ./shared
EXPOSE 3000
CMD ["node", "web/server.js"]

FROM base AS mcp
COPY dist/interfaces/mcp ./mcp
COPY dist/core ./core
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
- CLI commands
- MCP tools
- Database migrations

### E2E Tests
- Full workflows across interfaces
- Data consistency between interfaces

## Development Workflow

1. **Core First**: Implement data models, repositories, and services
2. **Database Setup**: Create migrations and database layer
3. **CLI Interface**: Implement as first interface (simpler)
4. **Web Interface**: Add REST API and frontend
5. **MCP Interface**: Implement MCP server
6. **Testing**: Add comprehensive tests
7. **Documentation**: Complete API docs and examples

This design ensures clear separation of concerns while maximizing code reuse across all three interfaces.
