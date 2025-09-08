import { DatabaseConnection } from './database-connection.js';
import { TodoService } from '@todo-app/backend/services/todo-service';

export interface MCPOptions { 
  dbPath?: string 
}

export async function startMCP(opts: MCPOptions = {}) {
  const conn = new DatabaseConnection({ dbPath: opts.dbPath });
  const svc = new TodoService(conn.db);

  // For the bundled CLI, we'll just import and use the original MCP
  // but we need to pass our custom database connection somehow
  // For now, let's just log that MCP is not fully supported in bundled mode
  console.log('MCP server functionality is limited in bundled CLI mode');
  console.log('Database path:', opts.dbPath);
  
  // We could implement a basic MCP server here if needed
  // For now, just ensure the database is accessible
  const todos = svc.list();
  console.log(`Database has ${todos.length} todos`);
  
  conn.close();
}
