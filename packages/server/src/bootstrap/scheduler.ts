import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '@/server/infrastructure/db/schema';
import { users } from '@/server/infrastructure/db/schema';
import { LoggerService } from '@/server/infrastructure/services/core/logger.adapter';
import { SchedulerContainer } from './di/scheduler-container';
import { env } from '@/server/env';
import { db } from '@/server/infrastructure/db/client';

const logger = new LoggerService('scheduler-bootstrap');

// Module-level reference to the scheduler container for access after initialization
let schedulerContainer: SchedulerContainer | null = null;

/**
 * Get the initialized scheduler container.
 * Throws if scheduler hasn't been initialized.
 */
export function getSchedulerContainer(): SchedulerContainer {
  if (!schedulerContainer) {
    throw new Error('Scheduler not initialized. Call initializeScheduler first.');
  }
  return schedulerContainer;
}

/**
 * Get the scheduler service from the initialized container.
 * Throws if scheduler hasn't been initialized.
 */
export function getSchedulerService() {
  return getSchedulerContainer().schedulerService;
}

/**
 * Callback for global automatic processing of all enabled lists.
 * Uses batch processing with global deduplication for efficiency.
 * Processes all users' lists for true multitenancy support.
 * Internal function used by initializeScheduler.
 */
async function processAllListsCallback(): Promise<void> {
  logger.info(
    'Global automatic processing triggered - using batch processing with global deduplication'
  );

  try {
    // Fetch all user IDs to process each user's lists
    const allUsers = await db.select({ id: users.id }).from(users);

    if (allUsers.length === 0) {
      logger.info('No users found, skipping automatic processing');
      return;
    }

    // Dynamic import to avoid circular dependencies
    const { processingContainer } = await import('./routers');

    // Process each user's lists
    for (const user of allUsers) {
      try {
        const result = await processingContainer.processBatchUseCase.execute({
          triggerType: 'scheduled',
          userId: user.id,
        });

        logger.info(
          {
            userId: user.id,
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
          'Completed automatic processing for user with batch deduplication'
        );
      } catch (error) {
        logger.error(
          {
            userId: user.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
          'Failed to process lists for user'
        );
      }
    }

    logger.info(
      { totalUsers: allUsers.length },
      'Completed global automatic processing for all users'
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
 * Creates the SchedulerContainer with proper DI and loads the global schedule.
 *
 * @param dbInstance - Database instance
 */
export async function initializeScheduler(
  dbInstance: BunSQLiteDatabase<typeof schema>
): Promise<void> {
  try {
    // Create scheduler container with all dependencies injected
    schedulerContainer = new SchedulerContainer({
      db: dbInstance,
      processAllListsCallback,
      timezone: env.TZ,
      logger: new LoggerService('scheduler'),
    });

    // Load the global schedule
    await schedulerContainer.schedulerService.loadScheduledLists();
    logger.info('Scheduler initialized and global schedule loaded');
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to initialize scheduler'
    );
  }
}
