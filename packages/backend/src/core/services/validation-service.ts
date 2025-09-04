import { ZodError } from 'zod';
import { 
  validateCreateTodo, 
  validateUpdateTodo, 
  validateTodoFilter,
  CreateTodoInput,
  UpdateTodoInput,
  TodoFilter 
} from '../models';
import { ValidationError } from '../errors';

export class ValidationService {
  validateCreateTodoInput(input: unknown): CreateTodoInput {
    try {
      return validateCreateTodo(input);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message,
          firstError.path.join('.')
        );
      }
      throw new ValidationError('Invalid input for creating todo');
    }
  }

  validateUpdateTodoInput(input: unknown): UpdateTodoInput {
    try {
      return validateUpdateTodo(input);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message,
          firstError.path.join('.')
        );
      }
      throw new ValidationError('Invalid input for updating todo');
    }
  }

  validateTodoFilterInput(input: unknown): TodoFilter {
    try {
      return validateTodoFilter(input);
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0];
        throw new ValidationError(
          firstError.message,
          firstError.path.join('.')
        );
      }
      throw new ValidationError('Invalid filter input');
    }
  }

  validateId(id: unknown): string {
    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new ValidationError('ID must be a non-empty string');
    }
    return id.trim();
  }

  validatePagination(limit?: unknown, offset?: unknown): { limit?: number; offset?: number } {
    const result: { limit?: number; offset?: number } = {};

    if (limit !== undefined) {
      if (typeof limit !== 'number' || limit < 1 || limit > 1000) {
        throw new ValidationError('Limit must be a number between 1 and 1000');
      }
      result.limit = limit;
    }

    if (offset !== undefined) {
      if (typeof offset !== 'number' || offset < 0) {
        throw new ValidationError('Offset must be a non-negative number');
      }
      result.offset = offset;
    }

    return result;
  }
}
