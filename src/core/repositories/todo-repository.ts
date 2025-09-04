import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from '../database';
import { Todo, CreateTodoInput, UpdateTodoInput, TodoFilter, TodoRow, todoFromRow, todoToRow } from '../models';
import { TodoNotFoundError, DatabaseError } from '../errors';
import { BaseRepository, PaginatedResult } from './base-repository';

export interface TodoRepository extends BaseRepository<Todo, CreateTodoInput, UpdateTodoInput> {
  findByFilter(filter: TodoFilter): Promise<Todo[]>;
  findByFilterPaginated(filter: TodoFilter): Promise<PaginatedResult<Todo>>;
  markAsCompleted(id: string): Promise<Todo>;
  markAsIncomplete(id: string): Promise<Todo>;
  count(filter?: Partial<TodoFilter>): Promise<number>;
}

export class SqliteTodoRepository implements TodoRepository {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async create(input: CreateTodoInput): Promise<Todo> {
    try {
      const id = uuidv4();
      const now = new Date();
      
      const todo: Todo = {
        id,
        title: input.title,
        description: input.description,
        priority: input.priority || 'medium',
        completed: false,
        createdAt: now,
        updatedAt: now,
        completedAt: undefined,
      };

      const row = todoToRow(todo);
      
      const stmt = this.db.instance.prepare(`
        INSERT INTO todos (id, title, description, priority, completed, created_at, updated_at, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        row.id,
        row.title,
        row.description,
        row.priority,
        row.completed,
        row.created_at,
        row.updated_at,
        row.completed_at
      );

      return todo;
    } catch (error) {
      throw new DatabaseError(
        `Failed to create todo: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async findById(id: string): Promise<Todo | null> {
    try {
      const stmt = this.db.instance.prepare('SELECT * FROM todos WHERE id = ?');
      const row = stmt.get(id) as TodoRow | undefined;
      
      return row ? todoFromRow(row) : null;
    } catch (error) {
      throw new DatabaseError(
        `Failed to find todo by id: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async findAll(): Promise<Todo[]> {
    try {
      const stmt = this.db.instance.prepare('SELECT * FROM todos ORDER BY created_at DESC');
      const rows = stmt.all() as TodoRow[];
      
      return rows.map(todoFromRow);
    } catch (error) {
      throw new DatabaseError(
        `Failed to find all todos: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async findByFilter(filter: TodoFilter): Promise<Todo[]> {
    try {
      let sql = 'SELECT * FROM todos WHERE 1=1';
      const params: any[] = [];

      if (filter.completed !== undefined) {
        sql += ' AND completed = ?';
        params.push(filter.completed ? 1 : 0);
      }

      if (filter.priority) {
        sql += ' AND priority = ?';
        params.push(filter.priority);
      }

      if (filter.search) {
        sql += ' AND (title LIKE ? OR description LIKE ?)';
        const searchPattern = `%${filter.search}%`;
        params.push(searchPattern, searchPattern);
      }

      sql += ' ORDER BY created_at DESC';

      if (filter.limit) {
        sql += ' LIMIT ?';
        params.push(filter.limit);
        
        if (filter.offset) {
          sql += ' OFFSET ?';
          params.push(filter.offset);
        }
      }

      const stmt = this.db.instance.prepare(sql);
      const rows = stmt.all(...params) as TodoRow[];
      
      return rows.map(todoFromRow);
    } catch (error) {
      throw new DatabaseError(
        `Failed to find todos by filter: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async findByFilterPaginated(filter: TodoFilter): Promise<PaginatedResult<Todo>> {
    try {
      // Get total count
      const total = await this.count({
        completed: filter.completed,
        priority: filter.priority,
        search: filter.search,
      });

      // Get items
      const items = await this.findByFilter(filter);

      return {
        items,
        total,
        offset: filter.offset || 0,
        limit: filter.limit || items.length,
      };
    } catch (error) {
      throw new DatabaseError(
        `Failed to find todos by filter (paginated): ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async update(id: string, input: UpdateTodoInput): Promise<Todo> {
    try {
      // First check if todo exists
      const existing = await this.findById(id);
      if (!existing) {
        throw new TodoNotFoundError(id);
      }

      const updates: string[] = [];
      const params: any[] = [];

      if (input.title !== undefined) {
        updates.push('title = ?');
        params.push(input.title);
      }

      if (input.description !== undefined) {
        updates.push('description = ?');
        params.push(input.description);
      }

      if (input.priority !== undefined) {
        updates.push('priority = ?');
        params.push(input.priority);
      }

      if (input.completed !== undefined) {
        updates.push('completed = ?');
        params.push(input.completed ? 1 : 0);
      }

      if (updates.length === 0) {
        return existing; // No updates to make
      }

      // Always update the updated_at field (handled by trigger)
      const sql = `UPDATE todos SET ${updates.join(', ')} WHERE id = ?`;
      params.push(id);

      const stmt = this.db.instance.prepare(sql);
      const result = stmt.run(...params);

      if (result.changes === 0) {
        throw new TodoNotFoundError(id);
      }

      // Return the updated todo
      const updated = await this.findById(id);
      if (!updated) {
        throw new TodoNotFoundError(id);
      }

      return updated;
    } catch (error) {
      if (error instanceof TodoNotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to update todo: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const stmt = this.db.instance.prepare('DELETE FROM todos WHERE id = ?');
      const result = stmt.run(id);

      if (result.changes === 0) {
        throw new TodoNotFoundError(id);
      }
    } catch (error) {
      if (error instanceof TodoNotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        `Failed to delete todo: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const stmt = this.db.instance.prepare('SELECT 1 FROM todos WHERE id = ? LIMIT 1');
      const result = stmt.get(id);
      return !!result;
    } catch (error) {
      throw new DatabaseError(
        `Failed to check todo existence: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  async markAsCompleted(id: string): Promise<Todo> {
    return this.update(id, { completed: true });
  }

  async markAsIncomplete(id: string): Promise<Todo> {
    return this.update(id, { completed: false });
  }

  async count(filter?: Partial<TodoFilter>): Promise<number> {
    try {
      let sql = 'SELECT COUNT(*) as count FROM todos WHERE 1=1';
      const params: any[] = [];

      if (filter?.completed !== undefined) {
        sql += ' AND completed = ?';
        params.push(filter.completed ? 1 : 0);
      }

      if (filter?.priority) {
        sql += ' AND priority = ?';
        params.push(filter.priority);
      }

      if (filter?.search) {
        sql += ' AND (title LIKE ? OR description LIKE ?)';
        const searchPattern = `%${filter.search}%`;
        params.push(searchPattern, searchPattern);
      }

      const stmt = this.db.instance.prepare(sql);
      const result = stmt.get(...params) as { count: number };
      
      return result.count;
    } catch (error) {
      throw new DatabaseError(
        `Failed to count todos: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }
}
