import type { Database } from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { CreateTodoInput, Todo, UpdateTodoInput } from '@todo-app/shared';

const createSchema = z.object({
	title: z.string().min(1),
	description: z.string().optional(),
	priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
});

const updateSchema = z.object({
	id: z.string().min(1),
	title: z.string().optional(),
	description: z.string().optional(),
	completed: z.boolean().optional(),
	priority: z.enum(['low', 'medium', 'high']).optional(),
});

function rowToTodo(row: any): Todo {
	return {
		id: row.id,
		title: row.title,
		description: row.description ?? undefined,
		completed: !!row.completed,
		priority: row.priority,
		createdAt: new Date(row.created_at).toISOString(),
		updatedAt: new Date(row.updated_at).toISOString(),
		completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : undefined,
	};
}

export class TodoService {
	constructor(private db: Database) {}

	list(): Todo[] {
		const stmt = this.db.prepare('SELECT * FROM todos ORDER BY created_at DESC');
		const rows = stmt.all();
		return rows.map(rowToTodo);
	}

	create(input: CreateTodoInput): Todo {
		const parsed = createSchema.parse(input);
		const id = randomUUID();
		const now = new Date().toISOString();
		const stmt = this.db.prepare(
			`INSERT INTO todos (id, title, description, completed, priority, created_at, updated_at)
			 VALUES (@id, @title, @description, 0, @priority, @now, @now)`
		);
		stmt.run({ id, title: parsed.title, description: parsed.description ?? null, priority: parsed.priority, now });
		const row = this.db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
		return rowToTodo(row);
	}

	update(input: UpdateTodoInput): Todo {
		const parsed = updateSchema.parse(input);
		const now = new Date().toISOString();
		const current: any = this.db.prepare('SELECT * FROM todos WHERE id = ?').get(parsed.id);
		if (!current) throw new Error('Todo not found');
		const next = {
			title: parsed.title ?? current.title,
			description: parsed.description ?? current.description,
			completed: typeof parsed.completed === 'boolean' ? (parsed.completed ? 1 : 0) : current.completed,
			priority: parsed.priority ?? current.priority,
			completed_at:
				typeof parsed.completed === 'boolean'
					? parsed.completed
						? new Date().toISOString()
						: null
					: current.completed_at,
		};
		this.db
			.prepare(
				`UPDATE todos SET title=@title, description=@description, completed=@completed, priority=@priority,
				 updated_at=@now, completed_at=@completed_at WHERE id=@id`
			)
			.run({ id: parsed.id, ...next, now });
		const row = this.db.prepare('SELECT * FROM todos WHERE id = ?').get(parsed.id);
		return rowToTodo(row);
	}

	delete(id: string): void {
		const info = this.db.prepare('DELETE FROM todos WHERE id = ?').run(id);
		if (info.changes === 0) throw new Error('Todo not found');
	}
}
