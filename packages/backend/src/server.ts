import { WebSocketServer, WebSocket } from 'ws';
import pino from 'pino';
import { DatabaseConnection } from './database/connection.js';
import { TodoService } from './services/todo-service.js';
import type { ClientMessage, ServerMessage } from '@todo-app/shared';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

export interface ServerOptions {
	port?: number;
	dbPath?: string;
}

export function startServer(opts: ServerOptions = {}) {
	const port = opts.port ?? 8080;
	const db = new DatabaseConnection({ dbPath: opts.dbPath }).db;
	const todoService = new TodoService(db);

	const wss = new WebSocketServer({ port });
	logger.info({ port }, 'WebSocket server listening');

	function broadcast(origin: WebSocket, message: ServerMessage) {
		for (const client of wss.clients) {
			if (client !== origin && client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify(message));
			}
		}
	}

	wss.on('connection', (ws) => {
		logger.info('Client connected');
		ws.on('message', (data) => {
			try {
				const msg = JSON.parse(data.toString()) as ClientMessage;
				const now = Date.now();
				const base = { id: msg.id ?? String(now), timestamp: now } as const;
				switch (msg.type) {
					case 'list_todos': {
						const todos = todoService.list();
						const resp: ServerMessage = { ...base, type: 'todos_listed', payload: { todos } };
						ws.send(JSON.stringify(resp));
						break;
					}
					case 'create_todo': {
						const todo = todoService.create(msg.payload);
						const resp: ServerMessage = { ...base, type: 'todo_created', payload: todo };
						ws.send(JSON.stringify(resp));
						broadcast(ws, resp);
						break;
					}
					case 'update_todo': {
						const todo = todoService.update(msg.payload);
						const resp: ServerMessage = { ...base, type: 'todo_updated', payload: todo };
						ws.send(JSON.stringify(resp));
						broadcast(ws, resp);
						break;
					}
					case 'delete_todo': {
						todoService.delete(msg.payload?.id);
						const resp: ServerMessage = { ...base, type: 'todo_deleted', payload: { id: msg.payload?.id } };
						ws.send(JSON.stringify(resp));
						broadcast(ws, resp);
						break;
					}
					default: {
						const resp: ServerMessage = { ...base, type: 'error', payload: { message: 'Unknown message type' } };
						ws.send(JSON.stringify(resp));
					}
				}
			} catch (err: any) {
				const resp: ServerMessage = {
					id: String(Date.now()),
					timestamp: Date.now(),
					type: 'error',
					payload: { message: err?.message ?? 'Invalid message' },
				};
				ws.send(JSON.stringify(resp));
			}
		});
	});

	return { wss };
}

// If run directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
	startServer();
}
