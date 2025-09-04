import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { AppContainer } from '../../container';
import { logger } from '../../shared';
import { Todo } from '../../core/models/todo';

export class McpServer {
  private server: Server;
  private container: AppContainer;

  constructor(container: AppContainer) {
    this.container = container;
    this.server = new Server(
      {
        name: 'todo-app',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupTools();
  }

  private setupTools(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'list_todos',
            description: 'List all todos, with optional filtering by status',
            inputSchema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['all', 'pending', 'completed'],
                  description: 'Filter todos by status (default: all)',
                },
              },
            },
          },
          {
            name: 'create_todo',
            description: 'Create a new todo item',
            inputSchema: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'The title of the todo item',
                },
                description: {
                  type: 'string',
                  description: 'Optional description for the todo item',
                },
              },
              required: ['title'],
            },
          },
          {
            name: 'update_todo',
            description: 'Update an existing todo item',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The ID of the todo to update',
                },
                title: {
                  type: 'string',
                  description: 'New title for the todo',
                },
                description: {
                  type: 'string',
                  description: 'New description for the todo',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'delete_todo',
            description: 'Delete a todo item',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The ID of the todo to delete',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'toggle_todo',
            description: 'Toggle the completion status of a todo item',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The ID of the todo to toggle',
                },
              },
              required: ['id'],
            },
          },
          {
            name: 'get_todo',
            description: 'Get a specific todo item by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'The ID of the todo to retrieve',
                },
              },
              required: ['id'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_todos':
            return await this.handleListTodos(args);
          
          case 'create_todo':
            return await this.handleCreateTodo(args);
          
          case 'update_todo':
            return await this.handleUpdateTodo(args);
          
          case 'delete_todo':
            return await this.handleDeleteTodo(args);
          
          case 'toggle_todo':
            return await this.handleToggleTodo(args);
          
          case 'get_todo':
            return await this.handleGetTodo(args);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        
        logger.error(`MCP tool error [${name}]`, error as Error);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${(error as Error).message}`
        );
      }
    });
  }

  private async handleListTodos(args: any) {
    const status = args?.status || 'all';
    let todos: Todo[];

    switch (status) {
      case 'pending':
        todos = await this.container.todoService.getPendingTodos();
        break;
      case 'completed':
        todos = await this.container.todoService.getCompletedTodos();
        break;
      default:
        todos = await this.container.todoService.getAllTodos();
        break;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            todos,
            count: todos.length,
            filter: status,
          }, null, 2),
        },
      ],
    };
  }

  private async handleCreateTodo(args: any) {
    if (!args?.title) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Title is required'
      );
    }

    const todo = await this.container.todoService.createTodo({
      title: args.title.trim(),
      description: args.description?.trim() || '',
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: 'Todo created successfully',
            todo,
          }, null, 2),
        },
      ],
    };
  }

  private async handleUpdateTodo(args: any) {
    if (!args?.id) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Todo ID is required'
      );
    }

    const updateData: any = {};
    if (args.title !== undefined) {
      updateData.title = args.title.trim();
    }
    if (args.description !== undefined) {
      updateData.description = args.description.trim();
    }

    const todo = await this.container.todoService.updateTodo(args.id, updateData);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: 'Todo updated successfully',
            todo,
          }, null, 2),
        },
      ],
    };
  }

  private async handleDeleteTodo(args: any) {
    if (!args?.id) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Todo ID is required'
      );
    }

    await this.container.todoService.deleteTodo(args.id);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: 'Todo deleted successfully',
            id: args.id,
          }, null, 2),
        },
      ],
    };
  }

  private async handleToggleTodo(args: any) {
    if (!args?.id) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Todo ID is required'
      );
    }

    const todo = await this.container.todoService.toggleTodo(args.id);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: `Todo marked as ${todo.completed ? 'completed' : 'pending'}`,
            todo,
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetTodo(args: any) {
    if (!args?.id) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Todo ID is required'
      );
    }

    const todo = await this.container.todoService.getTodoById(args.id);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            todo,
          }, null, 2),
        },
      ],
    };
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    
    logger.info('Starting MCP server in stdio mode...');
    
    // Connect the server to stdio transport
    await this.server.connect(transport);
    
    logger.info('MCP server connected and ready');
    
    // Log available tools for debugging
    logger.debug('Available MCP tools:', {
      tools: [
        'list_todos',
        'create_todo', 
        'update_todo',
        'delete_todo',
        'toggle_todo',
        'get_todo'
      ]
    });

    console.error('🔌 TODO App MCP Server started');
    console.error('   Protocol: Model Context Protocol (stdio)');
    console.error('   Tools: 6 available');
    console.error('   Ready for AI agent communication\n');
  }

  async stop(): Promise<void> {
    logger.info('Stopping MCP server...');
    await this.server.close();
    logger.info('MCP server stopped');
  }
}
