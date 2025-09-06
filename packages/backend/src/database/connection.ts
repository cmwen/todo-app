import Database from 'better-sqlite3';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface DBOptions {
	dbPath?: string;
}

export class DatabaseConnection {
	public db: Database.Database;
	private migrationsDir: string;

	constructor(opts: DBOptions = {}) {
		const dbPath = opts.dbPath ?? path.resolve(process.cwd(), 'data', 'todo.db');
		fs.mkdirSync(path.dirname(dbPath), { recursive: true });
		this.db = new Database(dbPath);

		// PRAGMAs for better concurrency
		this.db.pragma('journal_mode = WAL');
		this.db.pragma('synchronous = NORMAL');
		this.db.pragma('foreign_keys = ON');

		const __dirname = path.dirname(fileURLToPath(import.meta.url));
		// Point to source migrations so builds need not copy assets
		this.migrationsDir = path.resolve(__dirname, '../../src/database/migrations');
		this.applyMigrations();
	}

	private applyMigrations() {
		// Ensure schema
		const __dirname = path.dirname(fileURLToPath(import.meta.url));
		const schemaPath = path.resolve(__dirname, '../../src/database/schema.sql');
		const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
		this.db.exec(schemaSQL);

		// Run forward-only migrations if present
		if (!fs.existsSync(this.migrationsDir)) return;
		const files = fs
			.readdirSync(this.migrationsDir)
			.filter((f) => f.endsWith('.sql'))
			.sort();

		const getApplied = this.db.prepare('SELECT version FROM migrations ORDER BY version ASC').all() as { version: string }[];
		const applied = new Set(getApplied.map((r) => r.version));

		const insertMig = this.db.prepare('INSERT INTO migrations(version) VALUES (?)');
		const run = this.db.prepare('SELECT 1');

		for (const file of files) {
			if (applied.has(file)) continue;
			const sql = fs.readFileSync(path.join(this.migrationsDir, file), 'utf-8');
			this.db.transaction(() => {
				this.db.exec(sql);
				insertMig.run(file);
				run.get();
			})();
		}
	}

	close() {
		this.db.close();
	}
}
