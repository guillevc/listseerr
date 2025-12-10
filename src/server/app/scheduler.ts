import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '../db/schema';
import { scheduler } from '../lib/scheduler';
import { createLogger } from '../lib/logger';

const logger = createLogger('scheduler');

/**
 * Callback for processing a single list when triggered by scheduler.
 * Internal function used by initializeScheduler.
 *
 * @param listId - The ID of the list to process
 * @param db - Database instance
 */
async function processListCallback(
  listId: number,
  db: BunSQLiteDatabase<typeof schema>
): Promise<void> {
  logger.info({ listId }, 'Scheduler triggered - processing list');

  // Dynamic import to avoid circular dependencies
  const { processListById } = await import('../trpc/routers/lists-processor');

  try {
    await processListById(listId, 'scheduled', db);
  } catch (error) {
    logger.error(
      {
        listId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Failed to process scheduled list'
    );
  }
}

/**
 * Callback for global automatic processing of all enabled lists.
 * Uses batch processing with global deduplication for efficiency.
 * Internal function used by initializeScheduler.
 *
 * @param db - Database instance
 */
async function processAllListsCallback(
  db: BunSQLiteDatabase<typeof schema>
): Promise<void> {
  logger.info('Global automatic processing triggered - using batch processing with global deduplication');

  try {
    // Dynamic import to avoid circular dependencies
    const { processBatchWithDeduplication } = await import('../trpc/routers/lists-processor');
    const result = await processBatchWithDeduplication(db);

    logger.info(
      {
        processedLists: result.processedLists,
        totalItemsFound: result.totalItemsFound,
        globalUniqueItems: result.globalUniqueItems,
        cachedItems: result.cachedItems,
        itemsRequested: result.itemsRequested,
        itemsFailed: result.itemsFailed,
        duplicatesEliminated: result.totalItemsFound - result.globalUniqueItems,
        efficiencyGain: result.totalItemsFound > 0
          ? `${(((result.totalItemsFound - result.globalUniqueItems) / result.totalItemsFound) * 100).toFixed(1)}%`
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
 * Initialize the scheduler with database and callbacks.
 * Loads all scheduled lists and starts the scheduler.
 *
 * @param db - Database instance
 */
export async function initializeScheduler(
  db: BunSQLiteDatabase<typeof schema>
): Promise<void> {
  try {
    // Initialize scheduler with database and process callbacks
    scheduler.initialize(
      db,
      // Callback for processing individual list
      (listId: number) => processListCallback(listId, db),
      // Callback for processing all enabled lists (global automatic processing)
      () => processAllListsCallback(db)
    );

    // Load all scheduled lists
    await scheduler.loadScheduledLists();
    logger.info('Scheduler initialized and scheduled lists loaded');
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to initialize scheduler'
    );
  }
}
