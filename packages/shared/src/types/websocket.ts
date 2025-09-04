import { z } from 'zod';
import { CreateTodoInputSchema, UpdateTodoInputSchema, DeleteTodoInputSchema, TodoFilterSchema } from './todo.js';

// Base WebSocket Message
export const WebSocketMessageSchema = z.object({
  id: z.string(),
  type: z.string(),
  payload: z.any(),
  timestamp: z.number(),
});

export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;

// Client Message Types
export const ClientMessageTypeSchema = z.enum([
  'create_todo',
  'update_todo',
  'delete_todo',
  'list_todos',
  'ping'
]);

export type ClientMessageType = z.infer<typeof ClientMessageTypeSchema>;

// Client Messages
export const ClientMessageSchema = WebSocketMessageSchema.extend({
  type: ClientMessageTypeSchema,
});

export type ClientMessage = z.infer<typeof ClientMessageSchema>;

// Specific Client Message Payloads
export const CreateTodoMessageSchema = ClientMessageSchema.extend({
  type: z.literal('create_todo'),
  payload: CreateTodoInputSchema,
});

export const UpdateTodoMessageSchema = ClientMessageSchema.extend({
  type: z.literal('update_todo'),
  payload: UpdateTodoInputSchema,
});

export const DeleteTodoMessageSchema = ClientMessageSchema.extend({
  type: z.literal('delete_todo'),
  payload: DeleteTodoInputSchema,
});

export const ListTodosMessageSchema = ClientMessageSchema.extend({
  type: z.literal('list_todos'),
  payload: TodoFilterSchema.optional(),
});

export const PingMessageSchema = ClientMessageSchema.extend({
  type: z.literal('ping'),
  payload: z.object({}).optional(),
});

// Server Message Types
export const ServerMessageTypeSchema = z.enum([
  'todo_created',
  'todo_updated',
  'todo_deleted',
  'todos_listed',
  'error',
  'pong'
]);

export type ServerMessageType = z.infer<typeof ServerMessageTypeSchema>;

// Server Messages
export const ServerMessageSchema = WebSocketMessageSchema.extend({
  type: ServerMessageTypeSchema,
});

export type ServerMessage = z.infer<typeof ServerMessageSchema>;

// Error Message
export const ErrorMessageSchema = ServerMessageSchema.extend({
  type: z.literal('error'),
  payload: z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.any().optional(),
  }),
});

export type ErrorMessage = z.infer<typeof ErrorMessageSchema>;

// Connection States
export const ConnectionStateSchema = z.enum([
  'connecting',
  'connected',
  'disconnected',
  'reconnecting',
  'error'
]);

export type ConnectionState = z.infer<typeof ConnectionStateSchema>;
