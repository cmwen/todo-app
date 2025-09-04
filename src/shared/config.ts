import path from 'path';

export interface AppConfig {
  database: {
    path: string;
    readonly?: boolean;
    verbose?: boolean;
  };
  app: {
    name: string;
    version: string;
    maxTodosPerUser: number;
  };
  cli: {
    defaultLimit: number;
  };
  web: {
    port: number;
    host: string;
  };
  mcp: {
    port: number;
    host: string;
  };
}

// Default configuration
const defaultConfig: AppConfig = {
  database: {
    path: process.env.DATABASE_PATH || path.join(process.cwd(), 'database', 'todos.db'),
    readonly: process.env.DATABASE_READONLY === 'true',
    verbose: process.env.DATABASE_VERBOSE === 'true',
  },
  app: {
    name: 'TODO App',
    version: '1.0.0',
    maxTodosPerUser: parseInt(process.env.MAX_TODOS_PER_USER || '10000', 10),
  },
  cli: {
    defaultLimit: parseInt(process.env.CLI_DEFAULT_LIMIT || '20', 10),
  },
  web: {
    port: parseInt(process.env.WEB_PORT || '3000', 10),
    host: process.env.WEB_HOST || 'localhost',
  },
  mcp: {
    port: parseInt(process.env.MCP_PORT || '8080', 10),
    host: process.env.MCP_HOST || 'localhost',
  },
};

export function getConfig(): AppConfig {
  return { ...defaultConfig };
}

export function validateConfig(config: AppConfig): void {
  if (!config.database.path) {
    throw new Error('Database path is required');
  }

  if (config.app.maxTodosPerUser < 1) {
    throw new Error('Max todos per user must be at least 1');
  }

  if (config.cli.defaultLimit < 1 || config.cli.defaultLimit > 1000) {
    throw new Error('CLI default limit must be between 1 and 1000');
  }

  if (config.web.port < 1 || config.web.port > 65535) {
    throw new Error('Web port must be between 1 and 65535');
  }

  if (config.mcp.port < 1 || config.mcp.port > 65535) {
    throw new Error('MCP port must be between 1 and 65535');
  }
}
