"use client";
import { useEffect, useMemo, useRef, useState } from 'react';

type Todo = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
};

type ClientMessage =
  | { id: string; type: 'list_todos'; payload?: {}; timestamp: number }
  | { id: string; type: 'create_todo'; payload: { title: string; description?: string; priority?: 'low' | 'medium' | 'high' }; timestamp: number }
  | { id: string; type: 'update_todo'; payload: Partial<Todo> & { id: string }; timestamp: number }
  | { id: string; type: 'delete_todo'; payload: { id: string }; timestamp: number };

type ServerMessage =
  | { id: string; type: 'todos_listed'; payload: { todos: Todo[] }; timestamp: number }
  | { id: string; type: 'todo_created' | 'todo_updated'; payload: Todo; timestamp: number }
  | { id: string; type: 'todo_deleted'; payload: { id: string }; timestamp: number }
  | { id: string; type: 'error'; payload: { message: string }; timestamp: number };

function uid() { return Math.random().toString(36).slice(2); }

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const wsUrl = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
    return url;
  }, []);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      setIsConnected(true);
      const msg: ClientMessage = { id: uid(), type: 'list_todos', timestamp: Date.now(), payload: {} };
      ws.send(JSON.stringify(msg));
    };
    
    ws.onclose = () => {
      setIsConnected(false);
    };
    
    ws.onmessage = (ev) => {
      const msg: ServerMessage = JSON.parse(ev.data);
      if (msg.type === 'todos_listed') setTodos(msg.payload.todos);
      if (msg.type === 'todo_created') setTodos((t: Todo[]) => [msg.payload, ...t]);
      if (msg.type === 'todo_updated') setTodos((t: Todo[]) => t.map((x: Todo) => x.id === msg.payload.id ? msg.payload : x));
      if (msg.type === 'todo_deleted') setTodos((t: Todo[]) => t.filter((x: Todo) => x.id !== msg.payload.id));
    };
    
    return () => ws.close();
  }, [wsUrl]);

  function createTodo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim() || !wsRef.current) return;
    const msg: ClientMessage = { id: uid(), type: 'create_todo', timestamp: Date.now(), payload: { title } };
    wsRef.current.send(JSON.stringify(msg));
    setTitle('');
  }

  function toggle(t: Todo) {
    if (!wsRef.current) return;
    const msg: ClientMessage = { id: uid(), type: 'update_todo', timestamp: Date.now(), payload: { id: t.id, completed: !t.completed } };
    wsRef.current.send(JSON.stringify(msg));
  }

  function remove(id: string) {
    if (!wsRef.current) return;
    const msg: ClientMessage = { id: uid(), type: 'delete_todo', timestamp: Date.now(), payload: { id } };
    wsRef.current.send(JSON.stringify(msg));
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-muted-foreground">
          {isConnected ? 'Connected to server' : 'Disconnected from server'}
        </span>
      </div>

      {/* Add Todo Form */}
      <div className="bg-card border border-border rounded-lg p-6">
        <form onSubmit={createTodo} className="flex gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs doing?"
            className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Add Todo
          </button>
        </form>
      </div>

      {/* Todo List */}
      <div className="bg-card border border-border rounded-lg">
        {todos.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p className="text-lg mb-2">No todos yet</p>
            <p className="text-sm">Add your first todo above to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {todos.map((todo) => (
              <div key={todo.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggle(todo)}
                    className="w-4 h-4 rounded border border-input bg-background ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${todo.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {todo.title}
                    </p>
                    {todo.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {todo.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                      {todo.priority}
                    </span>
                    
                    <span className="text-xs text-muted-foreground">
                      {new Date(todo.updatedAt).toLocaleDateString()}
                    </span>
                    
                    <button
                      onClick={() => remove(todo.id)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-destructive hover:text-destructive-foreground h-8 w-8"
                      aria-label="Delete todo"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      {todos.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Total: {todos.length}</span>
            <span>Completed: {todos.filter(t => t.completed).length}</span>
            <span>Remaining: {todos.filter(t => !t.completed).length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
