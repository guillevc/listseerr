import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '../../infrastructure/db/schema';
import { scheduler } from '../../infrastructure/services/core/scheduler.service';
import { LoggerService } from '../../infrastructure/services/core/logger.service';

const logger = new LoggerService('scheduler');

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
  const { processingContainer } = await import('../trpc/routers/processing.router');

  try {
    // Load the list to get the owner userId
    const { mediaLists } = schema;
    const { eq } = await import('drizzle-orm');
    const list = await db.select().from(mediaLists).where(eq(mediaLists.id, listId)).limit(1);

    if (!list || list.length === 0) {
      logger.error({ listId }, 'List not found for scheduled processing');
      return;
    }

    const userId = list[0].userId;

    await processingContainer.processListUseCase.execute({
      listId,
      triggerType: 'scheduled',
      userId,
    });
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _db: BunSQLiteDatabase<typeof schema>
): Promise<void> {
  logger.info(
    'Global automatic processing triggered - using batch processing with global deduplication'
  );

  try {
    // Dynamic import to avoid circular dependencies
    const { processingContainer } = await import('../trpc/routers/processing.router');
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
 * Initialize the scheduler with database and callbacks.
 * Loads all scheduled lists and starts the scheduler.
 *
 * @param db - Database instance
 */
export async function initializeScheduler(db: BunSQLiteDatabase<typeof schema>): Promise<void> {
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
