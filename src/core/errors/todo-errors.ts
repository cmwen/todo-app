// Base error class for all Todo app errors
export abstract class TodoAppError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Todo not found error
export class TodoNotFoundError extends TodoAppError {
  readonly code = 'TODO_NOT_FOUND';
  readonly statusCode = 404;

  constructor(id: string) {
    super(`Todo with id '${id}' not found`);
  }
}

// Validation error
export class ValidationError extends TodoAppError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;

  constructor(message: string, public readonly field?: string) {
    super(message);
  }
}

// Database error
export class DatabaseError extends TodoAppError {
  readonly code = 'DATABASE_ERROR';
  readonly statusCode = 500;

  constructor(message: string, public readonly originalError?: Error) {
    super(message);
  }
}

// Operation not allowed error
export class OperationNotAllowedError extends TodoAppError {
  readonly code = 'OPERATION_NOT_ALLOWED';
  readonly statusCode = 403;

  constructor(message: string) {
    super(message);
  }
}

// Conflict error (e.g., trying to create duplicate)
export class ConflictError extends TodoAppError {
  readonly code = 'CONFLICT';
  readonly statusCode = 409;

  constructor(message: string) {
    super(message);
  }
}

// Type guard for TodoAppError
export function isTodoAppError(error: unknown): error is TodoAppError {
  return error instanceof TodoAppError;
}

// Helper function to create appropriate error from unknown error
export function createErrorFromUnknown(error: unknown): TodoAppError {
  if (isTodoAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new DatabaseError(error.message, error);
  }

  return new DatabaseError('An unknown error occurred');
}
