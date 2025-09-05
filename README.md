# Todo App

A modern, real-time todo application built with Next.js, WebSockets, and TypeScript in a pnpm monorepo structure.

## 🚀 Features

- **Real-time synchronization**: Changes are instantly synced across all connected clients via WebSockets
- **Modern UI**: Clean, responsive interface built with Next.js 15 App Router and Tailwind CSS
- **Type-safe**: Full TypeScript support with shared types across frontend and backend
- **Optimistic updates**: Immediate UI feedback with automatic rollback on errors
- **Priority management**: Organize todos by priority (low, medium, high)
- **Connection status**: Visual indicators for WebSocket connection state
- **Comprehensive filtering**: Filter by completion status and sort by various criteria
- **Monorepo structure**: Clean separation of concerns with pnpm workspaces

## 🏗️ Architecture

```
todo-app/
├── packages/
│   ├── shared/          # Shared TypeScript types and utilities
│   ├── backend/         # WebSocket server with in-memory database
│   └── frontend/        # Next.js App Router application
├── docs/               # Documentation
└── pnpm-workspace.yaml # Monorepo configuration
```

### Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, WebSockets, TypeScript
- **Database**: In-memory (easily replaceable with SQLite/PostgreSQL)
- **Package Manager**: pnpm with workspaces
- **Type Validation**: Zod schemas
- **Real-time Communication**: WebSocket with reconnection logic

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd todo-app
   pnpm install
   ```

2. **Build shared package:**
   ```bash
   pnpm --filter @todo-app/shared build
   ```

3. **Start the backend server:**
   ```bash
   pnpm --filter @todo-app/backend dev
   # or: cd packages/backend && pnpm dev
   ```

4. **Start the frontend development server:**
   ```bash
   pnpm --filter @todo-app/frontend dev
   # or: cd packages/frontend && pnpm dev
   ```

5. **Open the application:**
   - Frontend: http://localhost:3000
   - Backend WebSocket: ws://localhost:8080
   - Backend Health Check: http://localhost:8081/health

### Environment Configuration

1. **Frontend environment:**
   ```bash
   cd packages/frontend
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

## 📦 Package Scripts

### Root Level Commands
```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Run development servers for all packages
pnpm dev

# Run type checking across all packages
pnpm type-check

# Run linting across all packages
pnpm lint
```

### Frontend Package
```bash
cd packages/frontend

# Development server with Turbopack
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Type checking
pnpm type-check

# ESLint
pnpm lint
```

### Backend Package
```bash
cd packages/backend

# Development server with hot reload
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Type checking
pnpm type-check

# ESLint
pnpm lint
```

### Shared Package
```bash
cd packages/shared

# Build TypeScript definitions
pnpm build

# Type checking
pnpm type-check

# ESLint
pnpm lint
```

## 🔄 WebSocket API

### Client → Server Messages

```typescript
// List all todos
{ type: 'list_todos', payload: {} }

// Create a new todo
{ 
  type: 'create_todo', 
  payload: { 
    title: string, 
    description?: string, 
    priority?: 'low' | 'medium' | 'high' 
  } 
}

// Update an existing todo
{ 
  type: 'update_todo', 
  payload: { 
    id: string, 
    title?: string, 
    description?: string, 
    completed?: boolean, 
    priority?: 'low' | 'medium' | 'high' 
  } 
}

// Delete a todo
{ type: 'delete_todo', payload: { id: string } }
```

### Server → Client Messages

```typescript
// Todo list response
{ type: 'todos_listed', payload: { todos: Todo[] } }

// Todo created notification
{ type: 'todo_created', payload: Todo }

// Todo updated notification
{ type: 'todo_updated', payload: Todo }

// Todo deleted notification
{ type: 'todo_deleted', payload: { id: string } }

// Error response
{ type: 'error', payload: { message: string } }
```

## 🎯 Key Features Explained

### Real-time Synchronization
- WebSocket connection with automatic reconnection
- Exponential backoff retry strategy
- Message queuing during disconnections
- Optimistic updates with rollback on errors

### Type Safety
- Shared TypeScript types between frontend and backend
- Zod validation for runtime type checking
- Compile-time safety across the entire stack

### Modern Development Experience
- Next.js 15 with App Router
- Turbopack for fast development builds
- Hot reload for both frontend and backend
- ESLint and TypeScript for code quality

### Database Flexibility
- In-memory database for development simplicity
- Interface-based design for easy database swapping
- Ready for SQLite, PostgreSQL, or any other database

## 🧪 Testing the Application

1. **Open multiple browser windows** to http://localhost:3000
2. **Create todos** in one window and watch them appear in others
3. **Mark todos as complete** and see real-time updates
4. **Test connection resilience** by stopping/starting the backend
5. **Check optimistic updates** by creating todos while disconnected

## 🔧 Customization

### Adding New Todo Fields
1. Update types in `packages/shared/src/types/todo.ts`
2. Modify database schema in `packages/backend/src/database/TodoDatabase.ts`
3. Update UI components in `packages/frontend/src/components/`

### Changing Database
1. Replace `TodoDatabase` implementation in `packages/backend/src/database/`
2. Maintain the same interface for seamless integration
3. Update environment configuration as needed

### UI Customization
- Modify Tailwind CSS classes in components
- Add new components in `packages/frontend/src/components/`
- Update layouts in `packages/frontend/src/app/`

## 🚀 Production Deployment

### Backend Deployment
```bash
cd packages/backend
pnpm build
pnpm start
```

### Frontend Deployment
```bash
cd packages/frontend
pnpm build
pnpm start
```

### Environment Variables
- Set `NEXT_PUBLIC_WS_URL` to your production WebSocket server
- Configure backend port and database settings
- Set up proper CORS and security headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all packages build and type-check
5. Test the application thoroughly
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ using Next.js, WebSockets, and TypeScript
