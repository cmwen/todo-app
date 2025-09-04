# TODO App Design Document

**[Design → Product]** This design addresses all Product backlog items with a modern pnpm monorepo architecture.  
**[Design → Execution]** Implementation guide provided with specific tooling and dependency management.

## Executive Summary

This design transforms the existing TODO app into a modern pnpm workspace monorepo with:
- **Frontend**: Next.js 15 App Router with WebSocket real-time updates
- **Backend**: Node.js WebSocket server with SQLite persistence
- **Architecture**: Clean separation with shared TypeScript types and utilities

## Design Approaches Considered

### Approach 1: Single Package with Multiple Modes (Current)
- **Pros**: Simple deployment, single codebase
- **Cons**: Mixed concerns, harder to scale teams, monolithic dependencies
- **Trade-off**: Simplicity vs. modularity

### Approach 2: Pnpm Workspace Monorepo (Recommended)
- **Pros**: Clear separation of concerns, independent deployments, shared code reuse, better team scalability
- **Cons**: More complex setup, workspace management overhead
- **Trade-off**: Initial complexity for long-term maintainability

## Architecture Overview

```
todo-app/                          # Root workspace
├── packages/
│   ├── frontend/                  # Next.js 15 App Router
│   │   ├── app/                   # App Router structure
│   │   │   ├── layout.tsx         # Root layout with providers
│   │   │   ├── page.tsx           # Main todo interface
│   │   │   ├── api/               # API routes (optional)
│   │   │   └── components/        # UI components
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── lib/                   # WebSocket client, utils
│   │   ├── types/                 # Frontend-specific types
│   │   └── package.json           # Frontend dependencies
│   ├── backend/                   # WebSocket server
│   │   ├── src/
│   │   │   ├── server.ts          # WebSocket server entry
│   │   │   ├── handlers/          # WebSocket message handlers
│   │   │   ├── database/          # SQLite setup & migrations
│   │   │   ├── services/          # Business logic
│   │   │   └── types/             # Backend-specific types
│   │   └── package.json           # Backend dependencies
│   └── shared/                    # Shared utilities & types
│       ├── types/                 # Common TypeScript interfaces
│       ├── utils/                 # Shared utility functions
│       └── package.json           # Shared dependencies
├── pnpm-workspace.yaml           # Workspace configuration
├── package.json                  # Root package.json
├── tsconfig.json                 # Root TypeScript config
└── turbo.json                    # Build orchestration (optional)
```

## Technology Stack & Dependencies

### Core Technologies
- **Package Manager**: pnpm with workspaces
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.0+
- **Database**: SQLite with better-sqlite3

### Frontend Stack
- **Framework**: Next.js 15 with App Router
- **WebSocket**: next-ws for WebSocket integration
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks with WebSocket sync
- **Real-time**: WebSocket client for live updates

### Backend Stack
- **WebSocket Server**: ws library with Node.js
- **Database**: better-sqlite3 for persistence
- **Validation**: zod for message validation
- **Logging**: pino for structured logging

## Real-time Architecture

### WebSocket Communication Flow
```
Frontend (Next.js)     Backend (WebSocket Server)     Database (SQLite)
       │                          │                          │
       ├─ WebSocket Connect ──────┤                          │
       │                          ├─ Authenticate Client      │
       │                          │                          │
       ├─ Send: CreateTodo ───────┤                          │
       │                          ├─ Validate & Process ────►│
       │                          │                          ├─ INSERT todo
       │                          │◄─ Return todo ───────────┤
       │◄─ Broadcast: TodoCreated ┤                          │
       │                          │                          │
       ├─ Send: UpdateTodo ───────┤                          │
       │                          ├─ Validate & Process ────►│
       │                          │                          ├─ UPDATE todo
       │                          │◄─ Return updated ────────┤
       │◄─ Broadcast: TodoUpdated ┤                          │
```

### Message Protocol Design
```typescript
// shared/types/websocket.ts
export interface WebSocketMessage {
  id: string;              // Unique message ID
  type: string;            // Message type
  payload: any;            // Type-specific payload
  timestamp: number;       // Client timestamp
}

export interface ClientMessage extends WebSocketMessage {
  type: 'create_todo' | 'update_todo' | 'delete_todo' | 'list_todos';
}

export interface ServerMessage extends WebSocketMessage {
  type: 'todo_created' | 'todo_updated' | 'todo_deleted' | 'todos_listed' | 'error';
}
```

## Data Models & Validation

### Core Todo Interface
```typescript
// shared/types/todo.ts
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateTodoInput {
  id: string;
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
}
```

### Database Schema
```sql
-- backend/src/database/schema.sql
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_priority ON todos(priority);
CREATE INDEX idx_todos_created_at ON todos(created_at);
```

## Frontend Architecture

### Next.js App Router Structure
```typescript
// packages/frontend/app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WebSocketProvider>
          <TodoProvider>
            {children}
          </TodoProvider>
        </WebSocketProvider>
      </body>
    </html>
  );
}
```

### WebSocket Integration with Next.js
```typescript
// packages/frontend/lib/websocket-client.ts
import { useEffect, useRef, useState } from 'react';

export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setConnectionStatus('connected');
      setSocket(ws);
    };
    
    ws.onclose = () => {
      setConnectionStatus('disconnected');
      setSocket(null);
    };
    
    return () => ws.close();
  }, [url]);
  
  return { socket, connectionStatus };
}
```

### UI Component Strategy
- **shadcn/ui**: Base component library for consistency
- **Tailwind CSS**: Utility-first styling approach
- **Real-time updates**: Optimistic UI with WebSocket sync
- **Responsive design**: Mobile-first responsive layout

## Backend Architecture

### WebSocket Server Implementation
```typescript
// packages/backend/src/server.ts
import { WebSocketServer } from 'ws';
import { TodoService } from './services/todo-service.js';
import { DatabaseConnection } from './database/connection.js';

const wss = new WebSocketServer({ port: 8080 });
const db = new DatabaseConnection();
const todoService = new TodoService(db);

wss.on('connection', (ws, request) => {
  console.log('Client connected');
  
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleMessage(ws, message, todoService);
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Invalid message format' }
      }));
    }
  });
});
```

### Message Handler Pattern
```typescript
// packages/backend/src/handlers/todo-handlers.ts
export class TodoHandlers {
  constructor(private todoService: TodoService) {}
  
  async handleCreateTodo(ws: WebSocket, payload: CreateTodoInput) {
    const todo = await this.todoService.createTodo(payload);
    
    // Send to requesting client
    ws.send(JSON.stringify({
      type: 'todo_created',
      payload: todo
    }));
    
    // Broadcast to all other clients
    this.broadcastToOthers(ws, {
      type: 'todo_created',
      payload: todo
    });
  }
}
```

## Development Workflow

### Pnpm Workspace Commands
```json
{
  "scripts": {
    "dev": "pnpm --parallel --recursive dev",
    "dev:frontend": "pnpm --filter frontend dev",
    "dev:backend": "pnpm --filter backend dev",
    "build": "pnpm --recursive build",
    "test": "pnpm --recursive test",
    "type-check": "pnpm --recursive type-check"
  }
}
```

### Development Setup Process
1. **Initialize workspace**: `pnpm install` in root
2. **Start backend**: `pnpm dev:backend` (runs on :8080)
3. **Start frontend**: `pnpm dev:frontend` (runs on :3000)
4. **Full development**: `pnpm dev` (starts both)

## Project Structure & Hygiene **[Design → Product]** **[Design → Execution]**

### Required Scaffolding
```
todo-app/
├── .gitignore                     # Node.js + Next.js + SQLite ignores
├── pnpm-workspace.yaml           # Workspace configuration
├── package.json                  # Root package management
├── tsconfig.json                 # Shared TypeScript config
├── packages/
│   ├── frontend/
│   │   ├── .gitignore            # Next.js specific ignores
│   │   ├── next.config.js        # Next.js configuration
│   │   ├── tailwind.config.js    # Tailwind CSS config
│   │   └── tsconfig.json         # Extends root config
│   ├── backend/
│   │   ├── .gitignore           # Backend specific ignores
│   │   └── tsconfig.json        # Backend TypeScript config
│   └── shared/
│       └── tsconfig.json        # Shared types config
└── docs/                        # Documentation
    ├── README.md                # Project overview & quick start
    ├── design.md                # This document
    └── api.md                   # WebSocket API documentation
```

### .gitignore Strategy
- **Root**: General Node.js, editor, OS files
- **Frontend**: Next.js build artifacts, .env files
- **Backend**: SQLite databases, logs, build output
- **Shared**: Build artifacts only

## Risk Assessment **[Design → QA]**

### Technical Risks
1. **WebSocket Connection Stability**
   - Risk: Intermittent disconnections affecting real-time sync
   - Mitigation: Automatic reconnection with exponential backoff
   - Testing: Connection drop simulation tests

2. **Concurrent Data Modifications**
   - Risk: Race conditions in simultaneous todo updates
   - Mitigation: Optimistic locking with timestamps
   - Testing: Concurrent modification test scenarios

3. **Database Performance**
   - Risk: SQLite locking with high concurrent load
   - Mitigation: Connection pooling and query optimization
   - Testing: Load testing with multiple concurrent users

### Development Risks
1. **Workspace Dependencies**
   - Risk: Version conflicts between packages
   - Mitigation: Strict pnpm workspace configuration
   - Testing: Dependency audit scripts

2. **Type Safety Across Packages**
   - Risk: Type mismatches between frontend/backend
   - Mitigation: Shared types package with strict validation
   - Testing: Type-checking in CI pipeline

## Implementation Roadmap **[Design → Execution]**

### Phase 1: Workspace Setup (1-2 days)
- Initialize pnpm workspace
- Setup package structure
- Configure TypeScript and build tools
- Create shared types package

### Phase 2: Backend Foundation (2-3 days)
- WebSocket server implementation
- SQLite database setup
- Message handling framework
- Basic CRUD operations

### Phase 3: Frontend Development (3-4 days)
- Next.js App Router setup
- WebSocket client integration
- UI components with shadcn/ui
- Real-time state management

### Phase 4: Integration & Polish (1-2 days)
- End-to-end testing
- Error handling improvements
- Documentation completion
- Performance optimization

## Performance Considerations

### Frontend Optimizations
- **Component Memoization**: React.memo for todo list items
- **WebSocket Reconnection**: Smart reconnection strategy
- **Optimistic Updates**: Immediate UI feedback before server confirmation

### Backend Optimizations
- **Connection Pooling**: Manage WebSocket connections efficiently
- **Message Batching**: Batch database operations where possible
- **Caching**: In-memory cache for frequently accessed todos

## Security Considerations

### WebSocket Security
- **Origin Validation**: Verify client origins
- **Rate Limiting**: Prevent message spam
- **Input Validation**: Validate all incoming messages with zod

### Data Security
- **SQL Injection Prevention**: Use parameterized queries
- **Data Sanitization**: Clean user inputs
- **Access Control**: Basic client session management

## Success Metrics **[Design → QA]**

### Functional Success
- [ ] Real-time todo creation/updates across clients
- [ ] Persistent data storage with SQLite
- [ ] Responsive UI with optimistic updates
- [ ] Automatic WebSocket reconnection

### Technical Success
- [ ] <100ms WebSocket message round-trip
- [ ] Zero data loss during disconnections
- [ ] Clean workspace dependency management
- [ ] Type safety across all packages

## Future Enhancements

### Near-term (Next Sprint)
- User authentication and multi-tenant support
- Todo categories and tags
- Undo/redo functionality
- Export/import features

### Long-term (Future Releases)
- PWA support with offline functionality
- Collaborative editing with operational transforms
- Mobile app with React Native
- Advanced search and filtering

## Dependencies & External Libraries

### MCP Tools Research **[Design → Execution]**
Based on the latest library documentation:

1. **Next.js 15**: Use latest App Router features and WebSocket integration
2. **next-ws**: Recommended for WebSocket support in Next.js App Router
3. **shadcn/ui**: Modern component library for consistent UI
4. **better-sqlite3**: High-performance SQLite driver for Node.js

### Key Dependencies by Package
```yaml
# packages/frontend/package.json
dependencies:
  - next: "^15.0.0"
  - react: "^18.0.0"
  - next-ws: "^1.0.0"
  - "@radix-ui/react-*": "latest"
  - tailwindcss: "^3.0.0"

# packages/backend/package.json
dependencies:
  - ws: "^8.0.0"
  - better-sqlite3: "^9.0.0"
  - zod: "^3.0.0"
  - pino: "^8.0.0"

# packages/shared/package.json
dependencies:
  - zod: "^3.0.0"
```

---

**[Design → QA]** All design decisions require validation through the testing scenarios outlined in the risk assessment.  
**[Design → Execution]** Implementation should follow the phased approach with continuous integration of shared types and workspace dependency management.
