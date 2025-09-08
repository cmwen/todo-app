import Database from 'better-sqlite3';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface DBOptions {
	dbPath?: string;
}

export class DatabaseConnection {
	public db: Database.Database;

	constructor(opts: DBOptions = {}) {
		const dbPath = opts.dbPath ?? path.resolve(process.cwd(), 'data', 'todo.db');
		fs.mkdirSync(path.dirname(dbPath), { recursive: true });
		this.db = new Database(dbPath);

		// PRAGMAs for better concurrency
		this.db.pragma('journal_mode = WAL');
		this.db.pragma('synchronous = NORMAL');
		this.db.pragma('foreign_keys = ON');

		this.applyMigrations();
	}

	private applyMigrations() {
		// Inline schema for bundled CLI
		const schemaSQL = `
CREATE TABLE IF NOT EXISTS todos (
	id TEXT PRIMARY KEY,
	title TEXT NOT NULL,
	description TEXT,
	completed INTEGER DEFAULT 0,
	priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	completed_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);

CREATE TABLE IF NOT EXISTS migrations (
	version TEXT PRIMARY KEY,
	applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
		`;
		
		this.db.exec(schemaSQL);
	}

	close() {
		this.db.close();
	}
}
