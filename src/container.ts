import { DatabaseConnection } from './core/database/connection';
import { MigrationManager } from './core/database/migration-manager';
import { SqliteTodoRepository } from './core/repositories/todo-repository';
import { TodoService } from './core/services/todo-service';
import { ValidationService } from './core/services/validation-service';
import { AppConfig, getConfig, logger } from './shared';

export interface AppContainer {
  config: AppConfig;
  database: DatabaseConnection;
  todoRepository: SqliteTodoRepository;
  validationService: ValidationService;
  todoService: TodoService;
}

export class Container {
  private static instance: Container;
  private _container: AppContainer | null = null;

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  async initialize(): Promise<AppContainer> {
    if (this._container) {
      return this._container;
    }

    logger.info('Initializing application container...');

    try {
      // Load configuration
      const config = getConfig();
      logger.debug('Configuration loaded', { config });

      // Initialize database
      const database = new DatabaseConnection(config.database);
      await database.initialize();
      logger.info('Database connection established');

      // Run migrations
      const migrationManager = new MigrationManager(database);
      await migrationManager.runMigrations();
      logger.info('Database migrations completed');

      // Initialize repositories
      const todoRepository = new SqliteTodoRepository(database);
      logger.debug('Todo repository initialized');

      // Initialize services
      const validationService = new ValidationService();
      const todoService = new TodoService(todoRepository, validationService);
      logger.debug('Services initialized');

      this._container = {
        config,
        database,
        todoRepository,
        validationService,
        todoService,
      };

      logger.info('Application container initialized successfully');
      return this._container;
    } catch (error) {
      logger.error('Failed to initialize application container', error as Error);
      throw error;
    }
  }

  get container(): AppContainer {
    if (!this._container) {
      throw new Error('Container not initialized. Call initialize() first.');
    }
    return this._container;
  }

  async cleanup(): Promise<void> {
    if (this._container) {
      logger.info('Cleaning up application container...');
      
      try {
        await this._container.database.close();
        logger.info('Database connection closed');
      } catch (error) {
        logger.error('Error closing database connection', error as Error);
      }

      this._container = null;
      logger.info('Application container cleaned up');
    }
  }

  reset(): void {
    this._container = null;
  }
}

// Convenience function to get initialized container
export async function getContainer(): Promise<AppContainer> {
  const container = Container.getInstance();
  return await container.initialize();
}

// Graceful shutdown handler
export function setupGracefulShutdown(): void {
  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  
  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      
      try {
        const container = Container.getInstance();
        await container.cleanup();
        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown', error as Error);
        process.exit(1);
      }
    });
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', reason as Error);
    process.exit(1);
  });
}
