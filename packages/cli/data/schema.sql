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
