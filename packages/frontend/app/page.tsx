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
  const wsRef = useRef<WebSocket | null>(null);
  const wsUrl = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
    return url;
  }, []);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.onopen = () => {
      const msg: ClientMessage = { id: uid(), type: 'list_todos', timestamp: Date.now(), payload: {} };
      ws.send(JSON.stringify(msg));
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

  return (
    <div>
      <form onSubmit={createTodo} style={{ display: 'flex', gap: 8 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs doing?" style={{ flex: 1, padding: 8 }} />
        <button type="submit">Add</button>
      </form>
      <ul style={{ marginTop: 16, padding: 0, listStyle: 'none' }}>
        {todos.map(t => (
          <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <input type="checkbox" checked={t.completed} onChange={() => toggle(t)} />
            <span style={{ textDecoration: t.completed ? 'line-through' : 'none' }}>{t.title}</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#999' }}>{new Date(t.updatedAt).toLocaleString()}</span>
            <button onClick={() => remove(t.id)} style={{ marginLeft: 8 }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
