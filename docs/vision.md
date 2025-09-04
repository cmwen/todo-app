# TODO App Vision Document

## Problem Statement

We need to demonstrate how to build a unified CLI application that can operate in multiple modes while sharing the same core business logic. The TODO list app serves as a proof-of-concept showing how to architect a single executable that can function as a CLI tool, web server, or MCP server depending on the mode specified.

## User Scenarios

### CLI Mode (`npx todo-app` or `npx todo-app cli`)
- Developer or power user who prefers command-line tools
- Wants to quickly add/manage todos from terminal with commands like:
  - `npx todo-app add "Buy groceries"`
  - `npx todo-app list --status pending`
  - `npx todo-app complete 1`
- Needs integration with shell scripts and automation

### Web Mode (`npx todo-app web`)
- Starts a web server that serves a browser-based interface
- General user who prefers graphical interfaces
- Wants intuitive web-based todo management accessible at `http://localhost:3000`
- Expects modern UI/UX with form-based interactions

### MCP Mode (`npx todo-app mcp`)
- Runs in stdio mode following Model Context Protocol
- AI agents and other systems get programmatic access
- Enables AI assistants to manage todos on user's behalf
- Provides structured API for automated workflows through MCP tools

## Success Criteria

### Functional Requirements
- ✅ Add new todo items with title and description
- ✅ Edit existing todo items
- ✅ Delete todo items
- ✅ Mark items as done/undone
- ✅ List todos with filtering (all, pending, completed)
- ✅ Persistent storage using SQLite

### Architectural Requirements
- ✅ Core business logic shared across all interfaces
- ✅ Clean separation between data, business logic, and presentation
- ✅ Easy to add new interfaces without modifying core logic
- ✅ Consistent behavior across all interfaces
- ✅ Proper error handling and validation

### Technical Requirements
- ✅ TypeScript for type safety
- ✅ Single executable with mode-based operation
- ✅ Commander.js for CLI argument parsing and mode selection
- ✅ SQLite database with migration support
- ✅ Comprehensive test coverage for core logic
- ✅ Docker support for containerized deployment
- ✅ NPX compatibility for easy installation and usage
- ✅ Documentation and examples for each mode

## Architecture Overview

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
│   TodoService, ValidationService, etc.                     │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                      │
│   Todo, TodoRepository, BusinessRules                      │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                               │
│   SQLite Database, Migrations, Models                      │
└─────────────────────────────────────────────────────────────┘
```

## CLI Usage Examples

### CLI Mode (Default)
```bash
# Install and use directly
npm install -g todo-app
todo-app add "Buy groceries"
todo-app list
todo-app complete 1

# Or use with npx
npx todo-app add "Walk the dog"
npx todo-app list --status pending
npx todo-app edit 2 --title "Walk the dog for 30 minutes"
```

### Web Mode
```bash
# Start web server
npx todo-app web
# Opens browser interface at http://localhost:3000
# Or specify port: npx todo-app web --port 8080
```

### MCP Mode
```bash
# Run as MCP server (stdio mode)
npx todo-app mcp
# AI agents can now communicate via stdin/stdout using MCP protocol
```

## Risks & Trade-offs

### Risks
- **Mode Complexity**: Risk of CLI becoming complex with multiple modes
- **Dependency Management**: Different modes may require different dependencies
- **Startup Time**: Mode detection and initialization might slow down CLI commands
- **User Confusion**: Users might not understand different modes without clear documentation

### Mitigation Strategies
- Clear mode documentation and help text
- Lazy loading of mode-specific dependencies
- Fast startup optimization for CLI mode (most common)
- Progressive disclosure: start with CLI mode, mention other modes in help

### Trade-offs
- **Single Binary vs Multiple Tools**: Choose single binary for simplicity
- **Startup Speed vs Feature Richness**: Optimize for CLI speed, lazy load other modes
- **CLI Conventions vs Flexibility**: Follow standard CLI patterns while supporting modes

## Open Questions

1. **Mode Selection**: Should mode be a command (`todo-app web`) or flag (`todo-app --web`)?
   - **Decision**: Use commands (`web`, `mcp`) for clarity, default to CLI mode

2. **Configuration**: How should different modes share configuration (database path, etc.)?
   - **Decision**: Shared config file and environment variables

3. **Web Server Lifecycle**: Should web mode auto-open browser? How to handle shutdown?
   - **Decision**: Optional auto-open, graceful shutdown on SIGINT

4. **MCP Discovery**: How should MCP mode advertise its capabilities?
   - **Decision**: Follow MCP protocol standards for tool discovery

5. **Global vs Local Installation**: Should it work both ways?
   - **Decision**: Support both `npm install -g` and `npx` usage

## Next Steps

1. **[Implementation]** Update package.json with proper bin configuration for npx
2. **[Implementation]** Create main CLI entry point with mode detection
3. **[Implementation]** Implement CLI mode with Commander.js
4. **[Implementation]** Implement web mode with Express server
5. **[Implementation]** Implement MCP mode with stdio protocol
6. **[Testing]** Create mode-specific tests and integration tests
7. **[Documentation]** Update README with usage examples for each mode

## Tags
- **Target**: Production-ready CLI tool
- **Complexity**: Medium
- **Timeline**: 1-2 weeks
- **Priority**: CLI Mode > Web Mode > MCP Mode
