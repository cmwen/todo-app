# TODO App - Unified CLI Application

A unified TODO application that can run in three different modes: CLI commands, web server, and MCP protocol server. All modes share the same core business logic and data.

## 🎯 Project Goals

This project showcases how to:
- Build a unified CLI application with multiple operation modes
- Share core business logic across different user interfaces
- Implement clean architecture principles
- Create reusable and maintainable code
- Demonstrate NPX-compatible CLI design

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Single CLI Application                      │
│                    (npx todo-app)                          │
├─────────────────┬─────────────────┬─────────────────────────┤
│   CLI Mode      │   Web Mode      │   MCP Mode              │
│   (default)     │   (--web)       │   (--mcp)               │
│   Commander     │   Express       │   MCP Protocol          │
│   Interface     │   Server        │   stdio Handler         │
└─────────────────┴─────────────────┴─────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                             │
│   TodoService, ValidationService                           │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                      │
│   Todo Models, TodoRepository                              │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                               │
│   SQLite Database                                          │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Installation & Usage

### Quick Start with NPX (Recommended)

```bash
# CLI Mode (Default) - Direct todo management
npx todo-app add "Buy groceries"
npx todo-app list
npx todo-app done 1

# Web Mode - Start web server
npx todo-app web --port 3000

# MCP Mode - For AI agent integration
npx todo-app mcp
```

### Global Installation

```bash
npm install -g todo-app
todo-app add "Learn TypeScript"
todo-app web
todo-app mcp
```

### CLI Mode Commands

```bash
# Basic operations
todo-app add "Task title" --description "Optional description"
todo-app list [--pending|--completed]
todo-app show <id>
todo-app edit <id> --title "New title"
todo-app done <id>
todo-app delete <id>
todo-app toggle <id>

# Advanced features
todo-app search "keyword"
todo-app stats
todo-app clear  # Remove completed todos
todo-app --help
```

### Web Mode

```bash
# Start web server
todo-app web [--port 3000] [--host localhost] [--no-open]
```

Access the web interface at `http://localhost:3000`

#### REST API Endpoints

- `GET /api/todos` - List todos
- `POST /api/todos` - Create todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `PATCH /api/todos/:id/toggle` - Toggle completion

### MCP Mode

```bash
# Start MCP server for AI agents
todo-app mcp [--verbose]
```

Provides 6 MCP tools: `list_todos`, `create_todo`, `update_todo`, `delete_todo`, `toggle_todo`, `get_todo`

## 🚀 Features

- ✅ Add, edit, delete, and mark TODO items as done
- ✅ Persistent SQLite storage
- ✅ Three different interfaces sharing the same core logic:
  - **CLI**: Command-line interface for power users
  - **Web**: REST API with web frontend
  - **MCP**: Model Context Protocol server for AI integration

## 🛠️ Tech Stack

- **Language**: TypeScript
- **Runtime**: Node.js
- **Database**: SQLite
- **CLI**: Commander.js
- **Web**: Express.js
- **MCP**: Model Context Protocol SDK
- **Testing**: Jest
- **Build**: TypeScript compiler

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/cmwen/todo-app.git
cd todo-app
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Run database migrations:
```bash
npm run migrate
```

## 🎮 Usage

### CLI Interface

```bash
# Install globally (optional)
npm install -g .

# Add a new todo
todo add "Buy groceries" --description "Milk, bread, eggs"

# List all todos
todo list

# List only completed todos
todo list --completed

# Edit a todo
todo edit 123 --title "Buy organic groceries"

# Mark as done
todo done 123

# Delete a todo
todo delete 123
```

### Web Interface

```bash
# Start the web server
npm run start:web

# Open http://localhost:3000 in your browser
```

API Endpoints:
- `GET /api/todos` - List todos
- `POST /api/todos` - Create todo
- `GET /api/todos/:id` - Get todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo
- `PATCH /api/todos/:id/done` - Toggle completion

### MCP Server

```bash
# Start the MCP server
npm run start:mcp
```

Available MCP tools:
- `create_todo` - Create a new todo item
- `list_todos` - List todos with optional filtering
- `update_todo` - Update an existing todo
- `delete_todo` - Delete a todo
- `toggle_todo_completion` - Mark todo as done/undone

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🐳 Docker

Build and run with Docker:

```bash
# CLI
docker build -t todo-cli --target cli .
docker run -v $(pwd)/database:/app/database todo-cli add "Docker todo"

# Web
docker build -t todo-web --target web .
docker run -p 3000:3000 -v $(pwd)/database:/app/database todo-web

# MCP
docker build -t todo-mcp --target mcp .
docker run -p 8080:8080 -v $(pwd)/database:/app/database todo-mcp
```

## 📁 Project Structure

```
src/
├── core/                    # Shared business logic
│   ├── models/              # Data models
│   ├── repositories/        # Data access layer
│   ├── services/            # Business services
│   ├── database/            # Database setup
│   └── errors/              # Custom errors
├── interfaces/              # Different UI implementations
│   ├── cli/                 # Command line interface
│   ├── web/                 # Web application
│   └── mcp/                 # MCP server
├── shared/                  # Shared utilities
└── types/                   # TypeScript types
```

## 🔧 Development

```bash
# Start development servers
npm run dev:cli    # CLI in watch mode
npm run dev:web    # Web server with auto-reload
npm run dev:mcp    # MCP server in development

# Linting and formatting
npm run lint       # Check for lint errors
npm run lint:fix   # Fix lint errors
npm run format     # Format code with Prettier
```

## 📚 Documentation

- [Vision Document](./docs/vision.md) - Project goals and requirements
- [Technical Design](./docs/technical-design.md) - Detailed architecture
- [API Documentation](./docs/api.md) - REST API reference
- [CLI Reference](./docs/cli.md) - Command line usage
- [MCP Tools](./docs/mcp.md) - MCP server documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Add tests for new functionality
5. Run tests: `npm test`
6. Commit your changes: `git commit -am 'Add some feature'`
7. Push to the branch: `git push origin feature/my-feature`
8. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎓 Learning Outcomes

This project demonstrates:

1. **Clean Architecture**: Separation of concerns with clear boundaries
2. **Dependency Injection**: Loose coupling between components
3. **Repository Pattern**: Abstraction of data access
4. **Service Layer**: Business logic encapsulation
5. **Interface Adapters**: Multiple UIs with shared logic
6. **Test-Driven Development**: Comprehensive testing strategy
7. **TypeScript Best Practices**: Type safety and modern JavaScript features

Perfect for developers learning how to build scalable, maintainable applications with multiple interfaces!
