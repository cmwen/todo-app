import express, { Express, Request, Response } from 'express';
import path from 'path';
import { AppContainer } from '../../container';
import { logger } from '../../shared';
import { Todo } from '../../core/models/todo';

export interface WebServerOptions {
  port: number;
  host: string;
  autoOpen: boolean;
}

export class WebServer {
  private app: Express;
  private server: any;
  private container: AppContainer;

  constructor(container: AppContainer) {
    this.container = container;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Parse JSON bodies
    this.app.use(express.json());
    
    // Parse URL-encoded bodies
    this.app.use(express.urlencoded({ extended: true }));
    
    // Serve static files
    this.app.use(express.static(path.join(__dirname, 'public')));
    
    // Set view engine (if using templates)
    this.app.set('view engine', 'html');
    this.app.set('views', path.join(__dirname, 'views'));
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Serve main page
    this.app.get('/', (req: Request, res: Response) => {
      res.send(this.getMainPageHtml());
    });

    // API Routes
    this.app.get('/api/todos', this.getTodos.bind(this));
    this.app.post('/api/todos', this.createTodo.bind(this));
    this.app.put('/api/todos/:id', this.updateTodo.bind(this));
    this.app.delete('/api/todos/:id', this.deleteTodo.bind(this));
    this.app.patch('/api/todos/:id/toggle', this.toggleTodo.bind(this));

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ error: 'Not found' });
    });
  }

  private async getTodos(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      let todos: Todo[];

      if (status === 'completed') {
        todos = await this.container.todoService.getCompletedTodos();
      } else if (status === 'pending') {
        todos = await this.container.todoService.getPendingTodos();
      } else {
        todos = await this.container.todoService.getAllTodos();
      }

      res.json(todos);
    } catch (error) {
      logger.error('Error fetching todos', error as Error);
      res.status(500).json({ error: 'Failed to fetch todos' });
    }
  }

  private async createTodo(req: Request, res: Response): Promise<void> {
    try {
      const { title, description } = req.body;
      
      if (!title) {
        res.status(400).json({ error: 'Title is required' });
        return;
      }

      const todo = await this.container.todoService.createTodo({
        title: title.trim(),
        description: description?.trim() || ''
      });

      res.status(201).json(todo);
    } catch (error) {
      logger.error('Error creating todo', error as Error);
      res.status(500).json({ error: 'Failed to create todo' });
    }
  }

  private async updateTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description } = req.body;

      const todo = await this.container.todoService.updateTodo(id, {
        title: title?.trim(),
        description: description?.trim()
      });

      res.json(todo);
    } catch (error) {
      logger.error('Error updating todo', error as Error);
      if ((error as Error).message.includes('not found')) {
        res.status(404).json({ error: 'Todo not found' });
      } else {
        res.status(500).json({ error: 'Failed to update todo' });
      }
    }
  }

  private async deleteTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.container.todoService.deleteTodo(id);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting todo', error as Error);
      if ((error as Error).message.includes('not found')) {
        res.status(404).json({ error: 'Todo not found' });
      } else {
        res.status(500).json({ error: 'Failed to delete todo' });
      }
    }
  }

  private async toggleTodo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const todo = await this.container.todoService.toggleTodo(id);
      res.json(todo);
    } catch (error) {
      logger.error('Error toggling todo', error as Error);
      if ((error as Error).message.includes('not found')) {
        res.status(404).json({ error: 'Todo not found' });
      } else {
        res.status(500).json({ error: 'Failed to toggle todo' });
      }
    }
  }

  private getMainPageHtml(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TODO App</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: #555;
        }
        input, textarea, select {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            box-sizing: border-box;
        }
        textarea {
            resize: vertical;
            min-height: 80px;
        }
        button {
            background: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        button:hover {
            background: #0056b3;
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .todo-item {
            border: 1px solid #eee;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 4px;
            background: #fafafa;
        }
        .todo-item.completed {
            opacity: 0.7;
            background: #f0f8f0;
        }
        .todo-item.completed .todo-title {
            text-decoration: line-through;
        }
        .todo-title {
            font-weight: 500;
            margin-bottom: 5px;
        }
        .todo-description {
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
        }
        .todo-actions {
            display: flex;
            gap: 10px;
        }
        .todo-actions button {
            padding: 5px 10px;
            font-size: 12px;
        }
        .btn-success {
            background: #28a745;
        }
        .btn-success:hover {
            background: #1e7e34;
        }
        .btn-danger {
            background: #dc3545;
        }
        .btn-danger:hover {
            background: #c82333;
        }
        .btn-secondary {
            background: #6c757d;
        }
        .btn-secondary:hover {
            background: #545b62;
        }
        .filter-controls {
            margin-bottom: 20px;
            text-align: center;
        }
        .filter-controls button {
            margin: 0 5px;
            padding: 5px 15px;
        }
        .loading {
            text-align: center;
            color: #666;
            padding: 20px;
        }
        .error {
            color: #dc3545;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>TODO App</h1>
        
        <div id="error-message" class="error" style="display: none;"></div>
        
        <form id="todo-form">
            <div class="form-group">
                <label for="title">Title *</label>
                <input type="text" id="title" name="title" required>
            </div>
            <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" name="description"></textarea>
            </div>
            <button type="submit">Add TODO</button>
        </form>
        
        <hr style="margin: 30px 0;">
        
        <div class="filter-controls">
            <button onclick="filterTodos('all')" id="filter-all" class="btn-secondary">All</button>
            <button onclick="filterTodos('pending')" id="filter-pending" class="btn-secondary">Pending</button>
            <button onclick="filterTodos('completed')" id="filter-completed" class="btn-secondary">Completed</button>
        </div>
        
        <div id="loading" class="loading">Loading todos...</div>
        <div id="todos-container"></div>
    </div>

    <script>
        let currentFilter = 'all';
        
        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            loadTodos();
            setupForm();
        });
        
        function setupForm() {
            const form = document.getElementById('todo-form');
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                await createTodo();
            });
        }
        
        async function createTodo() {
            const form = document.getElementById('todo-form');
            const formData = new FormData(form);
            const data = {
                title: formData.get('title'),
                description: formData.get('description')
            };
            
            try {
                const response = await fetch('/api/todos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    form.reset();
                    hideError();
                    await loadTodos();
                } else {
                    const error = await response.json();
                    showError(error.error || 'Failed to create todo');
                }
            } catch (error) {
                showError('Network error: ' + error.message);
            }
        }
        
        async function loadTodos() {
            showLoading();
            
            try {
                const url = currentFilter === 'all' 
                    ? '/api/todos' 
                    : \`/api/todos?status=\${currentFilter}\`;
                    
                const response = await fetch(url);
                
                if (response.ok) {
                    const todos = await response.json();
                    displayTodos(todos);
                    hideError();
                } else {
                    showError('Failed to load todos');
                }
            } catch (error) {
                showError('Network error: ' + error.message);
            } finally {
                hideLoading();
            }
        }
        
        function displayTodos(todos) {
            const container = document.getElementById('todos-container');
            
            if (todos.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #666;">No todos found</p>';
                return;
            }
            
            container.innerHTML = todos.map(todo => \`
                <div class="todo-item \${todo.completed ? 'completed' : ''}">
                    <div class="todo-title">\${escapeHtml(todo.title)}</div>
                    \${todo.description ? \`<div class="todo-description">\${escapeHtml(todo.description)}</div>\` : ''}
                    <div class="todo-actions">
                        <button onclick="toggleTodo('\${todo.id}')" class="btn-success">
                            \${todo.completed ? 'Mark Pending' : 'Mark Complete'}
                        </button>
                        <button onclick="deleteTodo('\${todo.id}')" class="btn-danger">Delete</button>
                    </div>
                </div>
            \`).join('');
        }
        
        async function toggleTodo(id) {
            try {
                const response = await fetch(\`/api/todos/\${id}/toggle\`, {
                    method: 'PATCH'
                });
                
                if (response.ok) {
                    await loadTodos();
                    hideError();
                } else {
                    const error = await response.json();
                    showError(error.error || 'Failed to toggle todo');
                }
            } catch (error) {
                showError('Network error: ' + error.message);
            }
        }
        
        async function deleteTodo(id) {
            if (!confirm('Are you sure you want to delete this todo?')) {
                return;
            }
            
            try {
                const response = await fetch(\`/api/todos/\${id}\`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    await loadTodos();
                    hideError();
                } else {
                    const error = await response.json();
                    showError(error.error || 'Failed to delete todo');
                }
            } catch (error) {
                showError('Network error: ' + error.message);
            }
        }
        
        function filterTodos(filter) {
            currentFilter = filter;
            
            // Update button states
            document.querySelectorAll('.filter-controls button').forEach(btn => {
                btn.className = 'btn-secondary';
            });
            document.getElementById(\`filter-\${filter}\`).className = '';
            
            loadTodos();
        }
        
        function showError(message) {
            const errorDiv = document.getElementById('error-message');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
        
        function hideError() {
            document.getElementById('error-message').style.display = 'none';
        }
        
        function showLoading() {
            document.getElementById('loading').style.display = 'block';
            document.getElementById('todos-container').style.display = 'none';
        }
        
        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('todos-container').style.display = 'block';
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    </script>
</body>
</html>
    `;
  }

  async start(options: WebServerOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(options.port, options.host, () => {
        const url = `http://${options.host}:${options.port}`;
        logger.info(`Web server started at ${url}`);
        console.log(`\n🌐 TODO App Web Server`);
        console.log(`   Local:    ${url}`);
        console.log(`   Network:  http://${this.getNetworkAddress()}:${options.port}`);
        console.log('\n   Press Ctrl+C to stop\n');

        if (options.autoOpen) {
          this.openBrowser(url);
        }

        resolve();
      });

      this.server.on('error', (error: Error) => {
        logger.error('Web server error', error);
        reject(error);
      });
    });
  }

  async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          logger.info('Web server stopped');
          resolve();
        });
      });
    }
  }

  private openBrowser(url: string): void {
    const start = process.platform === 'darwin' ? 'open' : 
                  process.platform === 'win32' ? 'start' : 'xdg-open';
    
    require('child_process').exec(`${start} ${url}`, (error: any) => {
      if (error) {
        logger.debug('Could not auto-open browser', error);
      }
    });
  }

  private getNetworkAddress(): string {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
    
    return 'localhost';
  }
}
