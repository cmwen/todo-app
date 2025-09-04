import { Todo, CreateTodoInput, UpdateTodoInput, TodoFilter } from '../models';
import { PaginatedResult, SqliteTodoRepository } from '../repositories';
import { ValidationService } from './validation-service';
import { TodoNotFoundError, ValidationError, OperationNotAllowedError } from '../errors';

export interface TodoServiceConfig {
  maxTodosPerUser?: number;
  allowEmptyTitle?: boolean;
}

export class TodoService {
  private todoRepository: SqliteTodoRepository;
  private validationService: ValidationService;
  private config: TodoServiceConfig;

  constructor(
    todoRepository: SqliteTodoRepository,
    validationService: ValidationService,
    config: TodoServiceConfig = {}
  ) {
    this.todoRepository = todoRepository;
    this.validationService = validationService;
    this.config = {
      maxTodosPerUser: 10000,
      allowEmptyTitle: false,
      ...config,
    };
  }

  async createTodo(input: unknown): Promise<Todo> {
    // Validate input
    const validatedInput = this.validationService.validateCreateTodoInput(input);

    // Business rule: Check if we've hit the max todos limit
    if (this.config.maxTodosPerUser) {
      const currentCount = await this.todoRepository.count();
      if (currentCount >= this.config.maxTodosPerUser) {
        throw new OperationNotAllowedError(
          `Maximum number of todos (${this.config.maxTodosPerUser}) reached`
        );
      }
    }

    // Business rule: Don't allow empty titles unless explicitly allowed
    if (!this.config.allowEmptyTitle && !validatedInput.title.trim()) {
      throw new ValidationError('Todo title cannot be empty');
    }

    return this.todoRepository.create(validatedInput);
  }

  async getTodos(filter?: unknown, pagination?: { limit?: number; offset?: number }): Promise<{ todos: Todo[]; total: number }> {
    let validatedFilter: TodoFilter = {};
    
    if (filter) {
      validatedFilter = this.validationService.validateTodoFilterInput(filter);
    }

    if (pagination) {
      validatedFilter.limit = pagination.limit;
      validatedFilter.offset = pagination.offset;
    }

    const result = await this.todoRepository.findByFilterPaginated(validatedFilter);
    return {
      todos: result.items,
      total: result.total,
    };
  }

  async getTodosPaginated(filter?: unknown): Promise<PaginatedResult<Todo>> {
    let validatedFilter: TodoFilter = {};
    
    if (filter) {
      validatedFilter = this.validationService.validateTodoFilterInput(filter);
    }

    return this.todoRepository.findByFilterPaginated(validatedFilter);
  }

  async getTodoById(id: unknown): Promise<Todo> {
    const validatedId = this.validationService.validateId(id);
    
    const todo = await this.todoRepository.findById(validatedId);
    if (!todo) {
      throw new TodoNotFoundError(validatedId);
    }
    
    return todo;
  }

  async updateTodo(id: unknown, input: unknown): Promise<Todo> {
    const validatedId = this.validationService.validateId(id);
    const validatedInput = this.validationService.validateUpdateTodoInput(input);

    // Ensure at least one field is being updated
    if (Object.keys(validatedInput).length === 0) {
      throw new ValidationError('At least one field must be provided for update');
    }

    // Business rule: Don't allow empty titles unless explicitly allowed
    if (
      validatedInput.title !== undefined &&
      !this.config.allowEmptyTitle &&
      !validatedInput.title.trim()
    ) {
      throw new ValidationError('Todo title cannot be empty');
    }

    return this.todoRepository.update(validatedId, validatedInput);
  }

  async deleteTodo(id: unknown): Promise<void> {
    const validatedId = this.validationService.validateId(id);
    
    // Check if todo exists first to provide better error message
    const exists = await this.todoRepository.exists(validatedId);
    if (!exists) {
      throw new TodoNotFoundError(validatedId);
    }

    await this.todoRepository.delete(validatedId);
  }

  async markCompleted(id: unknown): Promise<Todo> {
    return this.markTodoCompleted(id);
  }

  async markIncomplete(id: unknown): Promise<Todo> {
    return this.markTodoIncomplete(id);
  }

  async toggleCompletion(id: unknown): Promise<Todo> {
    return this.toggleTodoCompletion(id);
  }

  async markTodoCompleted(id: unknown): Promise<Todo> {
    const validatedId = this.validationService.validateId(id);
    
    // Get current todo to check if it's already completed
    const todo = await this.getTodoById(validatedId);
    
    if (todo.completed) {
      throw new OperationNotAllowedError('Todo is already completed');
    }

    return this.todoRepository.markAsCompleted(validatedId);
  }

  async markTodoIncomplete(id: unknown): Promise<Todo> {
    const validatedId = this.validationService.validateId(id);
    
    // Get current todo to check if it's already incomplete
    const todo = await this.getTodoById(validatedId);
    
    if (!todo.completed) {
      throw new OperationNotAllowedError('Todo is already incomplete');
    }

    return this.todoRepository.markAsIncomplete(validatedId);
  }

  async toggleTodoCompletion(id: unknown): Promise<Todo> {
    const validatedId = this.validationService.validateId(id);
    
    const todo = await this.getTodoById(validatedId);
    
    if (todo.completed) {
      return this.todoRepository.markAsIncomplete(validatedId);
    } else {
      return this.todoRepository.markAsCompleted(validatedId);
    }
  }

  async getStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    completionRate: number;
    byPriority: {
      low: number;
      medium: number;
      high: number;
    };
  }> {
    const [total, completed, lowPriority, mediumPriority, highPriority] = await Promise.all([
      this.todoRepository.count(),
      this.todoRepository.count({ completed: true }),
      this.todoRepository.count({ priority: 'low' }),
      this.todoRepository.count({ priority: 'medium' }),
      this.todoRepository.count({ priority: 'high' }),
    ]);

    const pending = total - completed;
    const completionRate = total === 0 ? 0 : (completed / total) * 100;

    return {
      total,
      completed,
      pending,
      completionRate: Math.round(completionRate * 100) / 100, // Round to 2 decimal places
      byPriority: {
        low: lowPriority,
        medium: mediumPriority,
        high: highPriority,
      },
    };
  }

  async searchTodos(searchTerm: unknown, limit?: number): Promise<Todo[]> {
    if (typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
      throw new ValidationError('Search term must be a non-empty string');
    }

    const filter: TodoFilter = {
      search: searchTerm.trim(),
      limit: limit || 50,
    };

    return this.todoRepository.findByFilter(filter);
  }

  async bulkMarkCompleted(ids: unknown): Promise<Todo[]> {
    if (!Array.isArray(ids)) {
      throw new ValidationError('IDs must be provided as an array');
    }

    const validatedIds = ids.map(id => this.validationService.validateId(id));
    
    // Validate all todos exist before starting updates
    const todos = await Promise.all(
      validatedIds.map(id => this.getTodoById(id))
    );

    // Only update todos that are not already completed
    const todosToUpdate = todos.filter(todo => !todo.completed);
    
    if (todosToUpdate.length === 0) {
      throw new OperationNotAllowedError('All specified todos are already completed');
    }

    // Update in parallel
    const updatedTodos = await Promise.all(
      todosToUpdate.map(todo => this.todoRepository.markAsCompleted(todo.id))
    );

    return updatedTodos;
  }

  async clearCompleted(): Promise<number> {
    const completedTodos = await this.todoRepository.findByFilter({ completed: true });
    
    if (completedTodos.length === 0) {
      return 0;
    }

    // Delete all completed todos
    await Promise.all(
      completedTodos.map((todo: Todo) => this.todoRepository.delete(todo.id))
    );

    return completedTodos.length;
  }

  // Convenience methods for different interfaces
  async getAllTodos(): Promise<Todo[]> {
    return this.todoRepository.findAll();
  }

  async getPendingTodos(): Promise<Todo[]> {
    return this.todoRepository.findByFilter({ completed: false });
  }

  async getCompletedTodos(): Promise<Todo[]> {
    return this.todoRepository.findByFilter({ completed: true });
  }

  async toggleTodo(id: unknown): Promise<Todo> {
    return this.toggleTodoCompletion(id);
  }
}
