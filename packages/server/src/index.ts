import { createLogger } from './lib/logger';
import { env } from './env';
import { db } from './db';
import { runMigrations } from './app/bootstrap';
import { createHttpApp } from './app/create-http-app';
import { initializeScheduler } from './app/scheduler';

const logger = createLogger('server');

await runMigrations();

const app = createHttpApp();

initializeScheduler(db).catch((error) =>
  logger.error(
    { error: error instanceof Error ? error.message : 'Unknown error' },
    'Failed to start scheduler initialization'
  )
);

const port = env.PORT;
logger.info({ port }, 'Server starting');
logger.info(`Server running on http://localhost:${port}`);
logger.info(`tRPC endpoint: http://localhost:${port}/trpc`);
logger.info(`Health check: http://localhost:${port}/health`);

export default {
  port,
  fetch: app.fetch,
};
