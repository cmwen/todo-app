import { WebSocketServer, WebSocket } from 'ws';
import pino from 'pino';
import { DatabaseConnection } from './database-connection.js';
import { TodoService } from '@todo-app/backend/services/todo-service';

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

	wss.on('connection', (ws) => {
		logger.info('Client connected');

		// Send initial todos
		try {
			const todos = todoService.list();
			ws.send(JSON.stringify({ type: 'todos', todos }));
		} catch (error) {
			logger.error({ error }, 'Failed to fetch initial todos');
			ws.send(JSON.stringify({ type: 'error', message: 'Failed to fetch todos' }));
		}

		ws.on('message', (data) => {
			try {
				const message = JSON.parse(data.toString());
				logger.info({ message }, 'Received message');

				switch (message.type) {
					case 'create': {
						const todo = todoService.create(message.todo);
						const todos = todoService.list();
						// Broadcast to all clients
						wss.clients.forEach((client) => {
							if (client.readyState === WebSocket.OPEN) {
								client.send(JSON.stringify({ type: 'todos', todos }));
							}
						});
						break;
					}
					case 'update': {
						const todo = todoService.update(message.todo);
						const todos = todoService.list();
						// Broadcast to all clients
						wss.clients.forEach((client) => {
							if (client.readyState === WebSocket.OPEN) {
								client.send(JSON.stringify({ type: 'todos', todos }));
							}
						});
						break;
					}
					case 'delete': {
						todoService.delete(message.id);
						const todos = todoService.list();
						// Broadcast to all clients
						wss.clients.forEach((client) => {
							if (client.readyState === WebSocket.OPEN) {
								client.send(JSON.stringify({ type: 'todos', todos }));
							}
						});
						break;
					}
					case 'list': {
						const todos = todoService.list();
						ws.send(JSON.stringify({ type: 'todos', todos }));
						break;
					}
					default:
						ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
				}
			} catch (error) {
				logger.error({ error }, 'Error processing message');
				ws.send(JSON.stringify({ type: 'error', message: 'Invalid message' }));
			}
		});

		ws.on('close', () => {
			logger.info('Client disconnected');
		});

		ws.on('error', (error) => {
			logger.error({ error }, 'WebSocket error');
		});
	});

	return wss;
}
