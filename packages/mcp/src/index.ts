import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import pino from 'pino';
import { DatabaseConnection } from '@todo-app/backend/database/connection';
import { TodoService } from '@todo-app/backend/services/todo-service';

const logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });

export interface MCPOptions { dbPath?: string }

export async function startMCP(opts: MCPOptions = {}) {
	const conn = new DatabaseConnection({ dbPath: opts.dbPath });
	const svc = new TodoService(conn.db);

		const server = new McpServer({ name: 'todo-mcp', version: '0.1.0' });

			server.registerTool(
				'create_todo',
				{
					title: 'Create Todo',
					description: 'Create a todo',
					inputSchema: {
						title: z.string().min(1),
						description: z.string().optional(),
						priority: z.enum(['low', 'medium', 'high']).optional(),
					},
				},
				async (args) => {
					const todo = svc.create(args as any);
					return { content: [{ type: 'text', text: JSON.stringify(todo) }] };
				}
			);

			server.registerTool(
				'list_todos',
				{ title: 'List Todos', description: 'List todos' },
				async () => {
					const todos = svc.list();
					return { content: [{ type: 'text', text: JSON.stringify(todos) }] };
				}
			);

			server.registerTool(
				'update_todo',
				{
					title: 'Update Todo',
					description: 'Update a todo',
					inputSchema: {
						id: z.string().min(1),
						title: z.string().optional(),
						description: z.string().optional(),
						completed: z.boolean().optional(),
						priority: z.enum(['low', 'medium', 'high']).optional(),
					},
				},
				async (args) => {
					const todo = svc.update(args as any);
					return { content: [{ type: 'text', text: JSON.stringify(todo) }] };
				}
			);

			server.registerTool(
				'delete_todo',
				{
					title: 'Delete Todo',
					description: 'Delete a todo',
					inputSchema: { id: z.string().min(1) },
				},
				async (args) => {
					svc.delete((args as any).id);
					return { content: [{ type: 'text', text: `deleted ${(args as any).id}` }] };
				}
			);

	const transport = new StdioServerTransport();
	await server.connect(transport);

	const onSig = () => {
		logger.info('Shutting down MCP');
		conn.close();
		process.exit(0);
	};
	process.on('SIGINT', onSig);
	process.on('SIGTERM', onSig);
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
	startMCP();
}
