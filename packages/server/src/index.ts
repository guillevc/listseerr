import { LoggerService } from './infrastructure/services/core/logger.adapter';
import { env } from './env';
import { db } from './infrastructure/db/client';
import { runMigrations } from './bootstrap/database';
import { createHttpApp } from './bootstrap/http-server';
import { initializeScheduler } from './bootstrap/scheduler';

const logger = new LoggerService('server');

runMigrations();

const app = createHttpApp();

initializeScheduler(db).catch((error) =>
  logger.error(
    { error: error instanceof Error ? error.message : 'Unknown error' },
    'Failed to start scheduler initialization'
  )
);

const port = env.PORT;
const hostname = env.HOST;
logger.info({ port, hostname }, 'Server starting');
logger.info(`Server running on http://${hostname}:${port}`);
logger.info(`tRPC endpoint: http://${hostname}:${port}/trpc`);
logger.info(`Health check: http://${hostname}:${port}/health`);

export default {
  port,
  hostname,
  fetch: app.fetch,
};
