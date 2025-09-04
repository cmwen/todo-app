#!/usr/bin/env node

import { Command } from 'commander';
import { getContainer, setupGracefulShutdown } from './container';
import { logger } from './shared';

// Lazy imports for different modes to optimize startup time
async function startCliMode(args: string[]): Promise<void> {
  const { TodoCliCommands } = await import('./interfaces/cli/commands');
  const container = await getContainer();
  
  const program = new Command();
  program
    .name('todo-app')
    .description('A unified TODO app with CLI, web, and MCP modes')
    .version('1.0.0');

  // Register CLI commands
  const cliCommands = new TodoCliCommands(container);
  cliCommands.registerCommands(program);

  // Add global options
  program
    .option('-v, --verbose', 'Enable verbose logging')
    .option('-q, --quiet', 'Enable quiet mode')
    .hook('preAction', (thisCommand) => {
      const opts = thisCommand.opts();
      if (opts.verbose) {
        logger.setLevel(0); // DEBUG
      } else if (opts.quiet) {
        logger.setLevel(3); // ERROR only
      }
    });

  // Parse arguments (excluding the mode argument)
  await program.parseAsync(args);
}

async function startWebMode(args: string[]): Promise<void> {
  const { WebServer } = await import('./interfaces/web/server');
  const container = await getContainer();
  
  const program = new Command();
  program
    .name('todo-app web')
    .description('Start the TODO app web server')
    .option('-p, --port <port>', 'Port to run the server on', '3001')
    .option('-h, --host <host>', 'Host to bind the server to', 'localhost')
    .option('--no-open', 'Do not auto-open browser')
    .option('-v, --verbose', 'Enable verbose logging')
    .option('-q, --quiet', 'Enable quiet mode')
    .action(async (options) => {
      if (options.verbose) {
        logger.setLevel(0); // DEBUG
      } else if (options.quiet) {
        logger.setLevel(3); // ERROR only
      }

      const webServer = new WebServer(container);
      await webServer.start({
        port: parseInt(options.port),
        host: options.host,
        autoOpen: options.open
      });
    });

  await program.parseAsync(args);
}

async function startMcpMode(args: string[]): Promise<void> {
  const { McpServer } = await import('./interfaces/mcp/server');
  const container = await getContainer();
  
  const program = new Command();
  program
    .name('todo-app mcp')
    .description('Start the TODO app MCP server (stdio mode)')
    .option('-v, --verbose', 'Enable verbose logging')
    .option('-q, --quiet', 'Enable quiet mode')
    .action(async (options) => {
      if (options.verbose) {
        logger.setLevel(0); // DEBUG
      } else if (options.quiet) {
        logger.setLevel(3); // ERROR only
      }

      const mcpServer = new McpServer(container);
      await mcpServer.start();
    });

  await program.parseAsync(args);
}

async function main(): Promise<void> {
  try {
    // Setup graceful shutdown
    setupGracefulShutdown();

    const args = process.argv;
    const mode = args[2];

    // Determine mode based on first argument
    switch (mode) {
      case 'web':
        await startWebMode([...args.slice(0, 2), ...args.slice(3)]);
        break;
      
      case 'mcp':
        await startMcpMode([...args.slice(0, 2), ...args.slice(3)]);
        break;
      
      case 'help':
      case '--help':
      case '-h':
        showGlobalHelp();
        break;
      
      case 'version':
      case '--version':
      case '-V':
        console.log('1.0.0');
        break;
      
      default:
        // Default to CLI mode (including when mode is a CLI command)
        await startCliMode(args);
        break;
    }
  } catch (error) {
    logger.error('Application execution failed', error as Error);
    process.exit(1);
  }
}

function showGlobalHelp(): void {
  console.log(`
todo-app - A unified TODO application

Usage:
  todo-app [command] [options]           # CLI mode (default)
  todo-app web [options]                 # Web server mode
  todo-app mcp [options]                 # MCP server mode

Modes:
  CLI (default)    Interactive command-line interface
                   Examples:
                     todo-app add "Buy groceries"
                     todo-app list
                     todo-app complete 1

  web             Start web server
                   Examples:
                     todo-app web
                     todo-app web --port 8080
                     todo-app web --no-open

  mcp             Start MCP server (stdio)
                   Examples:
                     todo-app mcp
                     todo-app mcp --verbose

Global Options:
  -h, --help      Show help for a specific mode
  -V, --version   Show version number
  -v, --verbose   Enable verbose logging
  -q, --quiet     Enable quiet mode

Get mode-specific help:
  todo-app --help
  todo-app web --help
  todo-app mcp --help
`);
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', reason as Error);
  process.exit(1);
});

// Run the application
main();
