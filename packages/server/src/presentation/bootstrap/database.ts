import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { resolve } from 'path';
import { db } from '../../infrastructure/db/client';
import { createLogger } from '../../infrastructure/services/logger.service';
import { env } from '../../env';

const logger = createLogger('bootstrap');

export async function runMigrations(): Promise<void> {
  try {
    logger.info('Running database migrations...');

    // The 'resolve' function correctly handles both absolute paths (from Docker)
    // and paths relative to the current working directory (for local dev).
    const migrationsPath = resolve(env.MIGRATIONS_FOLDER);

    migrate(db, { migrationsFolder: migrationsPath });
    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to run database migrations'
    );
    process.exit(1);
  }
}
