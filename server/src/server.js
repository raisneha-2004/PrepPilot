import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const app = createApp();

const server = app.listen(env.PORT, env.HOST, () => {
  logger.info(`🚀 PrepPilot AI Backend running on http://${env.HOST}:${env.PORT}`);
  logger.info(`📚 Swagger OpenAPI Documentation available at http://localhost:${env.PORT}/docs`);
  logger.info(`🤖 AI Provider: [${env.AI_PROVIDER}] using model: [${env.AI_MODEL}]`);
});

// Graceful Shutdown
const shutdown = (signal) => {
  logger.info(`${signal} received: closing HTTP server gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
