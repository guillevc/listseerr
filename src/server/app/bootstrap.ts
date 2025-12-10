import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { db } from '../db';
import { createLogger } from '../lib/logger';
import { env } from '../env';

const logger = createLogger('bootstrap');

export async function runMigrations(): Promise<void> {
  try {
    logger.info('Running database migrations...');
    migrate(db, { migrationsFolder: env.MIGRATIONS_FOLDER });
    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to run database migrations'
    );
    process.exit(1);
  }
}
