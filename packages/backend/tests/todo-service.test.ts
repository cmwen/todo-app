import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseConnection } from '../src/database/connection.js';
import { TodoService } from '../src/services/todo-service.js';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('TodoService (SQLite)', () => {
  let dir: string;
  let dbPath: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'todo-test-'));
    dbPath = join(dir, 'test.db');
  });

  it('creates, lists, updates, and deletes a todo', () => {
    const conn = new DatabaseConnection({ dbPath });
    const svc = new TodoService(conn.db);
    const created = svc.create({ title: 'unit', description: 'test', priority: 'low' });
    expect(created.id).toBeTruthy();
    const listed = svc.list();
    expect(listed.length).toBe(1);
    const updated = svc.update({ id: created.id, completed: true });
    expect(updated.completed).toBe(true);
    svc.delete(created.id);
    expect(svc.list().length).toBe(0);
    conn.close();
    rmSync(dir, { recursive: true, force: true });
  });
});
