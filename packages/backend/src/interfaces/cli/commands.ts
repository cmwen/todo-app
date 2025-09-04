import { Command } from 'commander';
import { AppContainer } from '../../container';
import { CreateTodoInput, UpdateTodoInput, TodoFilter, Todo } from '../../core/models/todo';
import { formatDate, formatPriority, formatRelativeTime, formatStatus, parseBoolean, parseInteger, sanitizeInput, truncateString } from '../../shared';

export class TodoCliCommands {
  private todoService;

  constructor(container: AppContainer) {
    this.todoService = container.todoService;
  }

  registerCommands(program: Command): void {
    // Add command
    program
      .command('add')
      .description('Add a new todo item')
      .argument('<title>', 'Todo title')
      .option('-d, --description <description>', 'Todo description')
      .option('-p, --priority <priority>', 'Priority (low, medium, high)', 'medium')
      .action(async (title: string, options: { description?: string; priority?: string }) => {
        await this.addTodo(title, options);
      });

    // List command
    program
      .command('list')
      .alias('ls')
      .description('List todo items')
      .option('-c, --completed', 'Show only completed todos')
      .option('-p, --pending', 'Show only pending todos')
      .option('--priority <priority>', 'Filter by priority (low, medium, high)')
      .option('-l, --limit <limit>', 'Number of items to show', '20')
      .option('-o, --offset <offset>', 'Number of items to skip', '0')
      .option('-s, --search <query>', 'Search in title and description')
      .action(async (options: {
        completed?: boolean;
        pending?: boolean;
        priority?: string;
        limit?: string;
        offset?: string;
        search?: string;
      }) => {
        await this.listTodos(options);
      });

    // Show command
    program
      .command('show')
      .description('Show details of a specific todo')
      .argument('<id>', 'Todo ID')
      .action(async (id: string) => {
        await this.showTodo(id);
      });

    // Edit command
    program
      .command('edit')
      .description('Edit a todo item')
      .argument('<id>', 'Todo ID')
      .option('-t, --title <title>', 'New title')
      .option('-d, --description <description>', 'New description')
      .option('-p, --priority <priority>', 'New priority (low, medium, high)')
      .action(async (id: string, options: {
        title?: string;
        description?: string;
        priority?: string;
      }) => {
        await this.editTodo(id, options);
      });

    // Done command
    program
      .command('done')
      .description('Mark a todo as completed')
      .argument('<id>', 'Todo ID')
      .action(async (id: string) => {
        await this.markCompleted(id);
      });

    // Undone command
    program
      .command('undone')
      .description('Mark a todo as pending')
      .argument('<id>', 'Todo ID')
      .action(async (id: string) => {
        await this.markIncomplete(id);
      });

    // Delete command
    program
      .command('delete')
      .alias('rm')
      .description('Delete a todo item')
      .argument('<id>', 'Todo ID')
      .option('-f, --force', 'Skip confirmation')
      .action(async (id: string, options: { force?: boolean }) => {
        await this.deleteTodo(id, options);
      });

    // Toggle command
    program
      .command('toggle')
      .description('Toggle todo completion status')
      .argument('<id>', 'Todo ID')
      .action(async (id: string) => {
        await this.toggleTodo(id);
      });

    // Stats command
    program
      .command('stats')
      .description('Show todo statistics')
      .action(async () => {
        await this.showStats();
      });

    // Clear command
    program
      .command('clear')
      .description('Clear completed todos')
      .option('-f, --force', 'Skip confirmation')
      .action(async (options: { force?: boolean }) => {
        await this.clearCompleted(options);
      });

    // Search command
    program
      .command('search')
      .description('Search todos')
      .argument('<query>', 'Search query')
      .option('-l, --limit <limit>', 'Number of results to show', '20')
      .action(async (query: string, options: { limit?: string }) => {
        await this.searchTodos(query, options);
      });
  }

  private async addTodo(title: string, options: { description?: string; priority?: string }): Promise<void> {
    try {
      const input: CreateTodoInput = {
        title: sanitizeInput(title),
        description: options.description ? sanitizeInput(options.description) : undefined,
        priority: this.validatePriority(options.priority || 'medium'),
      };

      const todo = await this.todoService.createTodo(input);
      console.log(`✅ Todo created: ${todo.title} (ID: ${todo.id})`);
    } catch (error) {
      console.error(`❌ Error: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  private async listTodos(options: {
    completed?: boolean;
    pending?: boolean;
    priority?: string;
    limit?: string;
    offset?: string;
    search?: string;
  }): Promise<void> {
    try {
      const filter: TodoFilter = {};

      // Set completion filter
      if (options.completed && !options.pending) {
        filter.completed = true;
      } else if (options.pending && !options.completed) {
        filter.completed = false;
      }

      // Set priority filter
      if (options.priority) {
        filter.priority = this.validatePriority(options.priority);
      }

      // Set search filter
      if (options.search) {
        filter.search = sanitizeInput(options.search);
      }

      const limit = parseInteger(options.limit, 20);
      const offset = parseInteger(options.offset, 0);

      const { todos, total } = await this.todoService.getTodos(filter, { limit, offset });

      if (todos.length === 0) {
        console.log('📝 No todos found');
        return;
      }

      console.log(`\n📋 Todos (${todos.length}${total > todos.length ? ` of ${total}` : ''})\n`);

      todos.forEach((todo: Todo, index: number) => {
        const status = formatStatus(todo.completed);
        const priority = formatPriority(todo.priority);
        const created = formatRelativeTime(todo.createdAt);
        const title = truncateString(todo.title, 50);

        console.log(`${offset + index + 1}. ${status} ${priority} ${title}`);
        console.log(`   ID: ${todo.id}`);
        console.log(`   Created: ${created}`);
        
        if (todo.description) {
          const description = truncateString(todo.description, 80);
          console.log(`   ${description}`);
        }
        
        console.log('');
      });

      if (total > limit + offset) {
        console.log(`📄 Showing ${offset + 1}-${offset + todos.length} of ${total} todos`);
        console.log(`   Use --limit and --offset to see more`);
      }
    } catch (error) {
      console.error(`❌ Error: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  private async showTodo(id: string): Promise<void> {
    try {
      const todo = await this.todoService.getTodoById(id);
      
      console.log(`\n📝 Todo Details\n`);
      console.log(`Title: ${todo.title}`);
      console.log(`Status: ${formatStatus(todo.completed)}`);
      console.log(`Priority: ${formatPriority(todo.priority)}`);
      console.log(`ID: ${todo.id}`);
      console.log(`Created: ${formatDate(todo.createdAt)} (${formatRelativeTime(todo.createdAt)})`);
      console.log(`Updated: ${formatDate(todo.updatedAt)} (${formatRelativeTime(todo.updatedAt)})`);
      
      if (todo.completedAt) {
        console.log(`Completed: ${formatDate(todo.completedAt)} (${formatRelativeTime(todo.completedAt)})`);
      }
      
      if (todo.description) {
        console.log(`\nDescription:`);
        console.log(todo.description);
      }
      
      console.log('');
    } catch (error) {
      console.error(`❌ Error: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  private async editTodo(id: string, options: {
    title?: string;
    description?: string;
    priority?: string;
  }): Promise<void> {
    try {
      const updates: UpdateTodoInput = {};

      if (options.title) {
        updates.title = sanitizeInput(options.title);
      }

      if (options.description) {
        updates.description = sanitizeInput(options.description);
      }

      if (options.priority) {
        updates.priority = this.validatePriority(options.priority);
      }

      if (Object.keys(updates).length === 0) {
        console.log('❌ No updates provided. Use --title, --description, or --priority');
        process.exit(1);
      }

      const todo = await this.todoService.updateTodo(id, updates);
      console.log(`✅ Todo updated: ${todo.title}`);
    } catch (error) {
      console.error(`❌ Error: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  private async markCompleted(id: string): Promise<void> {
    try {
      const todo = await this.todoService.markCompleted(id);
      console.log(`✅ Todo completed: ${todo.title}`);
    } catch (error) {
      console.error(`❌ Error: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  private async markIncomplete(id: string): Promise<void> {
    try {
      const todo = await this.todoService.markIncomplete(id);
      console.log(`⏳ Todo marked as pending: ${todo.title}`);
    } catch (error) {
      console.error(`❌ Error: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  private async deleteTodo(id: string, options: { force?: boolean }): Promise<void> {
    try {
      // Get todo first to show what's being deleted
      const todo = await this.todoService.getTodoById(id);

      if (!options.force) {
        const { default: inquirer } = await import('inquirer');
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Delete todo "${todo.title}"?`,
            default: false,
          },
        ]);

        if (!confirm) {
          console.log('❌ Deletion cancelled');
          return;
        }
      }

      await this.todoService.deleteTodo(id);
      console.log(`🗑️ Todo deleted: ${todo.title}`);
    } catch (error) {
      console.error(`❌ Error: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  private async toggleTodo(id: string): Promise<void> {
    try {
      const todo = await this.todoService.toggleTodo(id);
      const status = todo.completed ? 'completed' : 'pending';
      console.log(`🔄 Todo toggled to ${status}: ${todo.title}`);
    } catch (error) {
      console.error(`❌ Error: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  private async showStats(): Promise<void> {
    try {
      const stats = await this.todoService.getStats();
      
      console.log(`\n📊 Todo Statistics\n`);
      console.log(`Total: ${stats.total}`);
      console.log(`Completed: ${stats.completed} (${Math.round((stats.completed / stats.total) * 100) || 0}%)`);
      console.log(`Pending: ${stats.pending} (${Math.round((stats.pending / stats.total) * 100) || 0}%)`);
      
      console.log(`\nBy Priority:`);
      console.log(`  High: ${stats.byPriority.high}`);
      console.log(`  Medium: ${stats.byPriority.medium}`);
      console.log(`  Low: ${stats.byPriority.low}`);
      
      console.log('');
    } catch (error) {
      console.error(`❌ Error: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  private async clearCompleted(options: { force?: boolean }): Promise<void> {
    try {
      const stats = await this.todoService.getStats();
      
      if (stats.completed === 0) {
        console.log('📝 No completed todos to clear');
        return;
      }

      if (!options.force) {
        const { default: inquirer } = await import('inquirer');
        const { confirm } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirm',
            message: `Clear ${stats.completed} completed todo${stats.completed > 1 ? 's' : ''}?`,
            default: false,
          },
        ]);

        if (!confirm) {
          console.log('❌ Clear cancelled');
          return;
        }
      }

      const count = await this.todoService.clearCompleted();
      console.log(`🧹 Cleared ${count} completed todo${count > 1 ? 's' : ''}`);
    } catch (error) {
      console.error(`❌ Error: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  private async searchTodos(query: string, options: { limit?: string }): Promise<void> {
    try {
      const limit = parseInteger(options.limit, 20);
      const todos = await this.todoService.searchTodos(sanitizeInput(query), limit);

      if (todos.length === 0) {
        console.log(`🔍 No todos found matching "${query}"`);
        return;
      }

      console.log(`\n🔍 Search Results for "${query}" (${todos.length})\n`);

      todos.forEach((todo: Todo, index: number) => {
        const status = formatStatus(todo.completed);
        const priority = formatPriority(todo.priority);
        const title = truncateString(todo.title, 50);

        console.log(`${index + 1}. ${status} ${priority} ${title}`);
        console.log(`   ID: ${todo.id}`);
        
        if (todo.description) {
          const description = truncateString(todo.description, 80);
          console.log(`   ${description}`);
        }
        
        console.log('');
      });
    } catch (error) {
      console.error(`❌ Error: ${(error as Error).message}`);
      process.exit(1);
    }
  }

  private validatePriority(priority: string): 'low' | 'medium' | 'high' {
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
    }
    return priority as 'low' | 'medium' | 'high';
  }
}
