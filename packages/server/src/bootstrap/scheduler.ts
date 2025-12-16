import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '@/server/infrastructure/db/schema';
import { scheduler } from '@/server/infrastructure/services/core/scheduler.adapter';
import { LoggerService } from '@/server/infrastructure/services/core/logger.adapter';

const logger = new LoggerService('scheduler');

/**
 * Callback for global automatic processing of all enabled lists.
 * Uses batch processing with global deduplication for efficiency.
 * Internal function used by initializeScheduler.
 */
async function processAllListsCallback(): Promise<void> {
  logger.info(
    'Global automatic processing triggered - using batch processing with global deduplication'
  );

  try {
    // Dynamic import to avoid circular dependencies
    const { processingContainer } = await import('./routers');
    // TODO: When multitenancy is implemented, process for all users separately
    // For now, process all lists for the default user (userId: 1)
    const result = await processingContainer.processBatchUseCase.execute({
      triggerType: 'scheduled',
      userId: 1,
    });

    logger.info(
      {
        processedLists: result.processedLists,
        totalItemsFound: result.totalItemsFound,
        itemsRequested: result.itemsRequested,
        itemsFailed: result.itemsFailed,
        duplicatesEliminated: result.totalItemsFound - result.itemsRequested,
        efficiencyGain:
          result.totalItemsFound > 0
            ? `${(((result.totalItemsFound - result.itemsRequested) / result.totalItemsFound) * 100).toFixed(1)}%`
            : 'N/A',
      },
      'Completed global automatic processing with batch deduplication'
    );
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Failed to complete global automatic processing'
    );
  }
}

/**
 * Initialize the scheduler with database and callback.
 * Loads the global schedule and starts the scheduler.
 *
 * @param db - Database instance
 */
export async function initializeScheduler(db: BunSQLiteDatabase<typeof schema>): Promise<void> {
  try {
    // Initialize scheduler with database and global processing callback
    scheduler.initialize(db, () => processAllListsCallback());

    // Load the global schedule
    await scheduler.loadScheduledLists();
    logger.info('Scheduler initialized and global schedule loaded');
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to initialize scheduler'
    );
  }
}
