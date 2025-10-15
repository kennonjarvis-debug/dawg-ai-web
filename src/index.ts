/**
 * Jarvis - Autonomous AI Agent
 * Main entry point
 */

import { config } from 'dotenv';

// Load environment variables
config();

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  console.log('Jarvis v0 - Initializing...');
  console.log('Environment:', process.env.NODE_ENV || 'development');

  // TODO: Initialize orchestrator and agents
  // This will be implemented in later prompts

  console.log('Jarvis initialized successfully');
}

// Handle unhandled rejections
process.on('unhandledRejection', (error: Error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Start the application
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: Error) => {
    console.error('Failed to start:', error);
    process.exit(1);
  });
}

export { main };
