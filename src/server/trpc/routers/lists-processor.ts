import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { mediaLists, executionHistory, jellyseerrConfigs, providerConfigs } from '../../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { fetchTraktList } from '../../services/trakt/client';
import { requestItemsToJellyseerr } from '../../services/jellyseerr/client';
import { getAlreadyRequestedIds, cacheRequestedItems } from '../../services/list-processor/deduplicator';
import { createLogger } from '../../lib/logger';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { db } from '../../db';

const logger = createLogger('list-processor');

/**
 * Process a media list by fetching items from Trakt and requesting them to Jellyseerr.
 *
 * This is the core processing function that:
 * 1. Fetches items from the Trakt list
 * 2. Deduplicates against cached items
 * 3. Requests new items to Jellyseerr
 * 4. Caches successful requests
 * 5. Updates execution history
 *
 * @param listId - The ID of the list to process
 * @param triggerType - Whether triggered manually or by scheduler
 * @param database - Database instance (injected for testing)
 * @returns Processing result with counts
 * @throws Error if list not found, disabled, or config missing
 */
export async function processListById(
  listId: number,
  triggerType: 'manual' | 'scheduled' = 'manual',
  database: BunSQLiteDatabase = db
) {
  // Get the list
  const [list] = await database
    .select()
    .from(mediaLists)
    .where(eq(mediaLists.id, listId))
    .limit(1);

  if (!list) {
    throw new Error('List not found');
  }

  if (!list.enabled) {
    throw new Error('List is disabled');
  }

  // Get Jellyseerr config
  const [config] = await database
    .select()
    .from(jellyseerrConfigs)
    .where(eq(jellyseerrConfigs.userId, 1))
    .limit(1);

  if (!config) {
    throw new Error('Jellyseerr configuration not found');
  }

  // Create execution history entry
  const [executionEntry] = await database
    .insert(executionHistory)
    .values({
      listId: list.id,
      startedAt: new Date(),
      status: 'running',
      triggerType,
    })
    .returning();

  try {
    logger.info(
      {
        listId: list.id,
        listName: list.name,
        listUrl: list.url,
        provider: list.provider,
        maxItems: list.maxItems,
        executionId: executionEntry.id,
        triggerType,
      },
      '🚀 Started processing list'
    );

    // Get Trakt client ID from provider configs
    const [traktConfig] = await database
      .select()
      .from(providerConfigs)
      .where(
        and(
          eq(providerConfigs.userId, 1),
          eq(providerConfigs.provider, 'trakt')
        )
      )
      .limit(1);

    if (!traktConfig?.clientId) {
      throw new Error('Trakt configuration not found. Please configure Trakt API credentials.');
    }

    // Fetch items from Trakt
    const traktItems = await fetchTraktList(
      list.url,
      list.maxItems,
      traktConfig.clientId
    );

    logger.info(
      {
        listId: list.id,
        itemsFound: traktItems.length,
      },
      'Fetched items from Trakt'
    );

    // Load cache and filter out already-requested items
    const cachedIds = await getAlreadyRequestedIds(database, list.id);
    const newItems = traktItems.filter(
      (item) => item.tmdbId && !cachedIds.has(item.tmdbId)
    );

    logger.info(
      {
        listId: list.id,
        totalItems: traktItems.length,
        cachedItems: cachedIds.size,
        newItems: newItems.length,
      },
      'Deduplication complete'
    );

    // Request new items to Jellyseerr
    const results = await requestItemsToJellyseerr(newItems, config);

    // Cache successful requests
    await cacheRequestedItems(database, list.id, results.successful);

    // Update execution history
    await database
      .update(executionHistory)
      .set({
        completedAt: new Date(),
        status: 'success',
        itemsFound: traktItems.length,
        itemsRequested: results.successful.length,
        itemsFailed: results.failed.length,
      })
      .where(eq(executionHistory.id, executionEntry.id));

    logger.info(
      {
        listId: list.id,
        listName: list.name,
        executionId: executionEntry.id,
        triggerType,
        summary: {
          totalFound: traktItems.length,
          alreadyCached: cachedIds.size,
          newItemsToRequest: newItems.length,
          successfullyRequested: results.successful.length,
          failed: results.failed.length,
          successRate: newItems.length > 0
            ? `${((results.successful.length / newItems.length) * 100).toFixed(1)}%`
            : 'N/A',
        },
      },
      '✅ Completed processing list successfully'
    );

    return {
      success: true,
      itemsFound: traktItems.length,
      itemsRequested: results.successful.length,
      itemsFailed: results.failed.length,
    };
  } catch (error) {
    logger.error(
      {
        listId: list.id,
        listName: list.name,
        executionId: executionEntry.id,
        triggerType,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      '❌ Failed to process list'
    );

    // Update execution history with error
    await database
      .update(executionHistory)
      .set({
        completedAt: new Date(),
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
      .where(eq(executionHistory.id, executionEntry.id));

    throw error;
  }
}

export const listsProcessorRouter = router({
  processList: publicProcedure
    .input(z.object({
      listId: z.number(),
      triggerType: z.enum(['manual', 'scheduled']).default('manual'),
    }))
    .mutation(async ({ ctx, input }) => {
      return processListById(input.listId, input.triggerType, ctx.db);
    }),

  processAll: publicProcedure.mutation(async ({ ctx }) => {
    // Get all enabled lists
    const lists = await ctx.db
      .select()
      .from(mediaLists)
      .where(eq(mediaLists.enabled, true));

    const results = [];
    for (const list of lists) {
      // This would trigger individual list processing
      // For now, just return mock results
      results.push({
        listId: list.id,
        success: true,
        itemCount: 0,
        requestedCount: 0,
      });
    }

    return results;
  }),

  getHistory: publicProcedure
    .input(
      z.object({
        listId: z.number(),
        limit: z.number().positive().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const history = await ctx.db
        .select()
        .from(executionHistory)
        .where(eq(executionHistory.listId, input.listId))
        .orderBy(desc(executionHistory.startedAt))
        .limit(input.limit);

      return history;
    }),
});
