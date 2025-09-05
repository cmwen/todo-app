import { WebSocket } from 'ws';
import { 
  ClientMessage, 
  ServerMessage, 
  CreateTodoMessageSchema,
  UpdateTodoMessageSchema,
  DeleteTodoMessageSchema,
  ListTodosMessageSchema,
  PingMessageSchema,
  ErrorMessage,
  generateId,
  generateTimestamp
} from '@todo-app/shared';
import { TodoDatabase } from '../database/todo-database.js';
import { logger } from '../utils/logger.js';

export class WebSocketHandler {
  constructor(
    private db: TodoDatabase,
    private broadcast: (message: ServerMessage, excludeClient?: WebSocket) => void
  ) {}

  async handleMessage(client: WebSocket, data: Buffer): Promise<void> {
    try {
      const rawMessage = JSON.parse(data.toString());
      
      // Validate base message structure
      const message = rawMessage as ClientMessage;
      
      logger.info(`Received message: ${message.type}`, { 
        messageId: message.id,
        type: message.type 
      });

      switch (message.type) {
        case 'create_todo':
          await this.handleCreateTodo(client, message);
          break;
        case 'update_todo':
          await this.handleUpdateTodo(client, message);
          break;
        case 'delete_todo':
          await this.handleDeleteTodo(client, message);
          break;
        case 'list_todos':
          await this.handleListTodos(client, message);
          break;
        case 'ping':
          await this.handlePing(client, message);
          break;
        default:
          await this.sendError(client, message.id, 'Unknown message type', 'UNKNOWN_MESSAGE_TYPE');
      }
    } catch (error) {
      logger.error('Error handling message:', error);
      await this.sendError(client, generateId(), 'Invalid message format', 'INVALID_MESSAGE');
    }
  }

  private async handleCreateTodo(client: WebSocket, message: ClientMessage): Promise<void> {
    try {
      const validatedMessage = CreateTodoMessageSchema.parse(message);
      const todo = await this.db.createTodo(validatedMessage.payload);
      
      const response: ServerMessage = {
        id: generateId(),
        type: 'todo_created',
        payload: todo,
        timestamp: generateTimestamp(),
      };

      // Send to requesting client
      this.sendMessage(client, response);
      
      // Broadcast to all other clients
      this.broadcast(response, client);
      
      logger.info(`Todo created: ${todo.id}`, { todoId: todo.id, title: todo.title });
    } catch (error) {
      logger.error('Error creating todo:', error);
      await this.sendError(client, message.id, 'Failed to create todo', 'CREATE_TODO_ERROR');
    }
  }

  private async handleUpdateTodo(client: WebSocket, message: ClientMessage): Promise<void> {
    try {
      const validatedMessage = UpdateTodoMessageSchema.parse(message);
      const todo = await this.db.updateTodo(validatedMessage.payload);
      
      if (!todo) {
        await this.sendError(client, message.id, 'Todo not found', 'TODO_NOT_FOUND');
        return;
      }

      const response: ServerMessage = {
        id: generateId(),
        type: 'todo_updated',
        payload: todo,
        timestamp: generateTimestamp(),
      };

      // Send to requesting client
      this.sendMessage(client, response);
      
      // Broadcast to all other clients
      this.broadcast(response, client);
      
      logger.info(`Todo updated: ${todo.id}`, { todoId: todo.id, title: todo.title });
    } catch (error) {
      logger.error('Error updating todo:', error);
      await this.sendError(client, message.id, 'Failed to update todo', 'UPDATE_TODO_ERROR');
    }
  }

  private async handleDeleteTodo(client: WebSocket, message: ClientMessage): Promise<void> {
    try {
      const validatedMessage = DeleteTodoMessageSchema.parse(message);
      const success = await this.db.deleteTodo(validatedMessage.payload.id);
      
      if (!success) {
        await this.sendError(client, message.id, 'Todo not found', 'TODO_NOT_FOUND');
        return;
      }

      const response: ServerMessage = {
        id: generateId(),
        type: 'todo_deleted',
        payload: { id: validatedMessage.payload.id },
        timestamp: generateTimestamp(),
      };

      // Send to requesting client
      this.sendMessage(client, response);
      
      // Broadcast to all other clients
      this.broadcast(response, client);
      
      logger.info(`Todo deleted: ${validatedMessage.payload.id}`, { todoId: validatedMessage.payload.id });
    } catch (error) {
      logger.error('Error deleting todo:', error);
      await this.sendError(client, message.id, 'Failed to delete todo', 'DELETE_TODO_ERROR');
    }
  }

  private async handleListTodos(client: WebSocket, message: ClientMessage): Promise<void> {
    try {
      const validatedMessage = ListTodosMessageSchema.parse(message);
  const todos = await this.db.listTodos(validatedMessage.payload ?? {});
      
      const response: ServerMessage = {
        id: generateId(),
        type: 'todos_listed',
        payload: { todos, total: todos.length },
        timestamp: generateTimestamp(),
      };

      this.sendMessage(client, response);
      
      logger.info(`Listed ${todos.length} todos`, { count: todos.length });
    } catch (error) {
      logger.error('Error listing todos:', error);
      await this.sendError(client, message.id, 'Failed to list todos', 'LIST_TODOS_ERROR');
    }
  }

  private async handlePing(client: WebSocket, message: ClientMessage): Promise<void> {
    try {
      PingMessageSchema.parse(message);
      
      const response: ServerMessage = {
        id: generateId(),
        type: 'pong',
        payload: {},
        timestamp: generateTimestamp(),
      };

      this.sendMessage(client, response);
    } catch (error) {
      logger.error('Error handling ping:', error);
      await this.sendError(client, message.id, 'Failed to handle ping', 'PING_ERROR');
    }
  }

  private async sendError(
    client: WebSocket, 
    messageId: string, 
    message: string, 
    code?: string
  ): Promise<void> {
    const errorMessage: ErrorMessage = {
      id: generateId(),
      type: 'error',
      payload: {
        message,
        code,
        details: { originalMessageId: messageId }
      },
      timestamp: generateTimestamp(),
    };

    this.sendMessage(client, errorMessage);
  }

  private sendMessage(client: WebSocket, message: ServerMessage): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}
