import { z } from 'zod';

// Todo Priority
export const TodoPrioritySchema = z.enum(['low', 'medium', 'high']);
export type TodoPriority = z.infer<typeof TodoPrioritySchema>;

// Base Todo Interface
export const TodoSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  completed: z.boolean().default(false),
  priority: TodoPrioritySchema.default('medium'),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
});

export type Todo = z.infer<typeof TodoSchema>;

// Create Todo Input
export const CreateTodoInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  priority: TodoPrioritySchema.optional(),
});

export type CreateTodoInput = z.infer<typeof CreateTodoInputSchema>;

// Update Todo Input
export const UpdateTodoInputSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  completed: z.boolean().optional(),
  priority: TodoPrioritySchema.optional(),
});

export type UpdateTodoInput = z.infer<typeof UpdateTodoInputSchema>;

// Delete Todo Input
export const DeleteTodoInputSchema = z.object({
  id: z.string(),
});

export type DeleteTodoInput = z.infer<typeof DeleteTodoInputSchema>;

// Todo Filter
export const TodoFilterSchema = z.object({
  completed: z.boolean().optional(),
  priority: TodoPrioritySchema.optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export type TodoFilter = z.infer<typeof TodoFilterSchema>;
