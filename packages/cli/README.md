# @cmwen/todo-app

A simple command-line todo application built with Node.js.

## Installation

Install globally via npm:

```bash
npm install -g @cmwen/todo-app
```

## Usage

After installation, you can use the `todo-app` command:

```bash
# Show help
todo-app --help

# Add a new todo
todo-app add "Buy groceries"

# List all todos
todo-app list

# Mark a todo as complete
todo-app complete <todo-id>

# Delete a todo
todo-app delete <todo-id>
```

## Features

- ✅ Add new todos
- ✅ List all todos
- ✅ Mark todos as complete/incomplete
- ✅ Delete todos
- ✅ Local SQLite database storage
- ✅ Simple command-line interface

## Requirements

- Node.js 16 or higher

## License

MIT

## Repository

This package is part of the [todo-app](https://github.com/cmwen/todo-app) monorepo.
