import { LoggerService } from './infrastructure/services/core/logger.service';
import { env } from './env';
import { db } from './infrastructure/db/client';
import { runMigrations } from './presentation/bootstrap/database';
import { createHttpApp } from './presentation/bootstrap/http-server';
import { initializeScheduler } from './presentation/bootstrap/scheduler';

const logger = new LoggerService('server');

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
