import { z } from 'zod';

// Core Todo interface
export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Input DTOs for creating and updating todos
export interface CreateTodoInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
}

// Filter interface for querying todos
export interface TodoFilter {
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  search?: string;
  limit?: number;
  offset?: number;
}

// Zod schemas for runtime validation
export const CreateTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be less than 255 characters')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .trim()
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high'])
    .default('medium'),
});

export const UpdateTodoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title must not be empty')
    .max(255, 'Title must be less than 255 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .trim()
    .optional(),
  priority: z
    .enum(['low', 'medium', 'high'])
    .optional(),
  completed: z.boolean().optional(),
});

export const TodoFilterSchema = z.object({
  completed: z.boolean().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  search: z.string().trim().optional(),
  limit: z.number().int().min(1).max(1000).optional(),
  offset: z.number().int().min(0).optional(),
});

// Type guards for runtime type checking
export function isTodo(obj: any): obj is Todo {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    ['low', 'medium', 'high'].includes(obj.priority) &&
    typeof obj.completed === 'boolean' &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date &&
    (obj.description === undefined || typeof obj.description === 'string') &&
    (obj.completedAt === undefined || obj.completedAt instanceof Date)
  );
}

// Database row interface (matches SQLite table structure)
export interface TodoRow {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  completed: number; // SQLite stores booleans as integers
  created_at: string; // SQLite stores dates as ISO strings
  updated_at: string;
  completed_at: string | null;
}

// Utility functions for converting between Todo and TodoRow
export function todoFromRow(row: TodoRow): Todo {
  return {
    id: row.id,
    title: row.title,
    description: row.description || undefined,
    priority: row.priority as 'low' | 'medium' | 'high',
    completed: Boolean(row.completed),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  };
}

export function todoToRow(todo: Todo): TodoRow {
  return {
    id: todo.id,
    title: todo.title,
    description: todo.description || null,
    priority: todo.priority,
    completed: todo.completed ? 1 : 0,
    created_at: todo.createdAt.toISOString(),
    updated_at: todo.updatedAt.toISOString(),
    completed_at: todo.completedAt ? todo.completedAt.toISOString() : null,
  };
}

// Validation helper functions
export function validateCreateTodo(input: unknown): CreateTodoInput {
  return CreateTodoSchema.parse(input);
}

export function validateUpdateTodo(input: unknown): UpdateTodoInput {
  return UpdateTodoSchema.parse(input);
}

export function validateTodoFilter(input: unknown): TodoFilter {
  return TodoFilterSchema.parse(input);
}
