#!/usr/bin/env node

import { Command } from 'commander';
import { getContainer, setupGracefulShutdown } from '../../container';
import { logger } from '../../shared';
import { TodoCliCommands } from './commands';

async function main(): Promise<void> {
  try {
    // Setup graceful shutdown
    setupGracefulShutdown();

    // Initialize container
    const container = await getContainer();
    
    // Create CLI program
    const program = new Command();
    program
      .name('todo-cli')
      .description('A simple CLI for managing TODO items')
      .version('1.0.0');

    // Register commands
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

    // Handle no command
    if (process.argv.length === 2) {
      program.help();
    }

    // Parse arguments
    await program.parseAsync(process.argv);
  } catch (error) {
    logger.error('CLI execution failed', error as Error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception in CLI', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection in CLI', reason as Error);
  process.exit(1);
});

// Run the CLI
main();
