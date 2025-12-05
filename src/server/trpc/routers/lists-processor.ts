import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { mediaLists, executionHistory, jellyseerrConfigs, providerConfigs } from '../../db/schema';
import { eq, desc, and, asc } from 'drizzle-orm';
import { fetchTraktList } from '../../services/trakt/client';
import { fetchTraktChart } from '../../services/trakt/chart-client';
import { fetchMdbListList } from '../../services/mdblist/client';
import { requestItemsToJellyseerr } from '../../services/jellyseerr/client';
import { getAlreadyRequestedIds, cacheRequestedItems } from '../../services/list-processor/deduplicator';
import { createLogger } from '../../lib/logger';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { db } from '../../db';
import * as schema from '../../db/schema';

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
  database: BunSQLiteDatabase<typeof schema> = db
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

  // Note: We don't check list.enabled here because manual processing should work
  // regardless of the scheduled toggle state. The enabled field only controls
  // whether the list is included in automatic scheduled processing.

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

    // Get provider configurations
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

    // Validate provider configuration based on list provider
    if ((list.provider === 'trakt' || list.provider === 'traktChart') && !traktConfig?.clientId) {
      throw new Error(
        'Trakt API configuration is required to process Trakt lists and charts. ' +
        'Please configure your Trakt Client ID in Settings → API Keys.'
      );
    }

    // Get MDBList config if needed
    const [mdbListConfig] = list.provider === 'mdblist'
      ? await database
          .select()
          .from(providerConfigs)
          .where(
            and(
              eq(providerConfigs.userId, 1),
              eq(providerConfigs.provider, 'mdblist')
            )
          )
          .limit(1)
      : [null];

    if (list.provider === 'mdblist' && !mdbListConfig?.apiKey) {
      throw new Error(
        'MDBList API configuration is required to process MDBList lists. ' +
        'Please configure your MDBList API Key in Settings → API Keys.'
      );
    }

    // Fetch items from provider
    let items;
    if (list.provider === 'trakt' && traktConfig?.clientId) {
      items = await fetchTraktList(list.url, list.maxItems, traktConfig.clientId);
    } else if (list.provider === 'traktChart' && traktConfig?.clientId) {
      items = await fetchTraktChart(list.url, list.maxItems, traktConfig.clientId);
    } else if (list.provider === 'mdblist' && mdbListConfig?.apiKey) {
      items = await fetchMdbListList(list.url, list.maxItems, mdbListConfig.apiKey);
    } else {
      throw new Error(`Unsupported or unconfigured provider: ${list.provider}`);
    }

    logger.info(
      {
        listId: list.id,
        provider: list.provider,
        itemsFound: items.length,
      },
      'Fetched items from provider'
    );

    // Load cache and filter out already-requested items
    const cachedIds = await getAlreadyRequestedIds(database, list.id);
    const newItems = items.filter(
      (item) => item.tmdbId && !cachedIds.has(item.tmdbId)
    );

    const listCachedCount = items.length - newItems.length;

    logger.info(
      {
        listId: list.id,
        totalItems: items.length,
        cachedItems: listCachedCount,
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
        itemsFound: items.length,
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
          totalFound: items.length,
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
      itemsFound: items.length,
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

/**
 * Process all enabled lists in batch with global deduplication.
 *
 * This optimized flow:
 * 1. Fetches items from all lists
 * 2. Deduplicates TMDB IDs globally across all lists
 * 3. Checks global cache once
 * 4. Requests unique items to Jellyseerr
 * 5. Updates cache with successful requests
 *
 * This prevents duplicate Jellyseerr requests when multiple lists contain the same items.
 *
 * @param database - Database instance
 * @returns Processing summary with counts per list
 */
export async function processBatchWithDeduplication(
  database: BunSQLiteDatabase<typeof schema> = db,
  triggerType: 'manual' | 'scheduled' = 'scheduled'
): Promise<{
  success: boolean;
  processedLists: number;
  totalItemsFound: number;
  globalUniqueItems: number;
  cachedItems: number;
  itemsRequested: number;
  itemsFailed: number;
}> {
  // Generate a unique batch ID for this processing run
  const batchId = `batch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  logger.info({ batchId, triggerType }, 'Starting batch processing with global deduplication');

  // Get all enabled lists
  const lists = await database
    .select()
    .from(mediaLists)
    .where(eq(mediaLists.enabled, true))
    .orderBy(asc(mediaLists.createdAt));

  if (lists.length === 0) {
    logger.info('No enabled lists found');
    return {
      success: true,
      processedLists: 0,
      totalItemsFound: 0,
      globalUniqueItems: 0,
      cachedItems: 0,
      itemsRequested: 0,
      itemsFailed: 0,
    };
  }

  logger.info({ listCount: lists.length }, 'Processing lists with global deduplication');

  // Get Jellyseerr config
  const [config] = await database
    .select()
    .from(jellyseerrConfigs)
    .where(eq(jellyseerrConfigs.userId, 1))
    .limit(1);

  if (!config) {
    throw new Error('Jellyseerr configuration not found');
  }

  // Get provider configs
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

  const [mdbListConfig] = await database
    .select()
    .from(providerConfigs)
    .where(
      and(
        eq(providerConfigs.userId, 1),
        eq(providerConfigs.provider, 'mdblist')
      )
    )
    .limit(1);

  // PHASE 1: Fetch all items from all lists
  logger.info('PHASE 1: Fetching items from all lists');

  interface ListWithItems {
    list: typeof mediaLists.$inferSelect;
    items: Awaited<ReturnType<typeof fetchTraktList>>;
    executionId: number;
  }

  const listsWithItems: ListWithItems[] = [];
  let totalItemsFound = 0;

  for (let i = 0; i < lists.length; i++) {
    const list = lists[i];

    // Create execution history entry
    const [executionEntry] = await database
      .insert(executionHistory)
      .values({
        listId: list.id,
        batchId,
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
          provider: list.provider,
          position: `${i + 1}/${lists.length}`,
        },
        'Fetching items from list'
      );

      // Validate provider configuration
      if ((list.provider === 'trakt' || list.provider === 'traktChart') && !traktConfig?.clientId) {
        throw new Error('Trakt API configuration required');
      }
      if (list.provider === 'mdblist' && !mdbListConfig?.apiKey) {
        throw new Error('MDBList API configuration required');
      }

      // Fetch items based on provider
      let items: Awaited<ReturnType<typeof fetchTraktList>> = [];

      if (list.provider === 'trakt' && traktConfig?.clientId) {
        items = await fetchTraktList(list.url, list.maxItems, traktConfig.clientId);
      } else if (list.provider === 'traktChart' && traktConfig?.clientId) {
        items = await fetchTraktChart(list.url, list.maxItems, traktConfig.clientId);
      } else if (list.provider === 'mdblist' && mdbListConfig?.apiKey) {
        items = await fetchMdbListList(list.url, list.maxItems, mdbListConfig.apiKey);
      }

      totalItemsFound += items.length;

      listsWithItems.push({
        list,
        items,
        executionId: executionEntry.id,
      });

      logger.info(
        {
          listId: list.id,
          itemsFound: items.length,
          position: `${i + 1}/${lists.length}`,
        },
        'Fetched items from list'
      );

      // Add delay between fetches to respect rate limits
      if (i < lists.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error(
        {
          listId: list.id,
          listName: list.name,
          error: errorMessage,
        },
        'Failed to fetch items from list'
      );

      // Update execution history with error
      await database
        .update(executionHistory)
        .set({
          completedAt: new Date(),
          status: 'error',
          errorMessage,
        })
        .where(eq(executionHistory.id, executionEntry.id));

      // Continue with other lists
    }
  }

  // PHASE 2: Global deduplication
  logger.info('PHASE 2: Performing global deduplication');

  // Aggregate all TMDB IDs from all lists into a single map
  // Map: TMDB ID -> first MediaItem found (for metadata)
  const globalItemsMap = new Map<number, Awaited<ReturnType<typeof fetchTraktList>>[0]>();

  for (const { items } of listsWithItems) {
    for (const item of items) {
      if (item.tmdbId && !globalItemsMap.has(item.tmdbId)) {
        globalItemsMap.set(item.tmdbId, item);
      }
    }
  }

  const globalUniqueItems = globalItemsMap.size;

  logger.info(
    {
      totalItemsFound,
      globalUniqueItems,
      duplicatesAcrossLists: totalItemsFound - globalUniqueItems,
    },
    'Global deduplication complete'
  );

  // PHASE 3: Check global cache
  logger.info('PHASE 3: Checking global cache');

  const cachedIds = await getAlreadyRequestedIds(database, 0); // Pass 0 since it's global

  // Filter out cached items
  const itemsToRequest: Awaited<ReturnType<typeof fetchTraktList>> = [];
  for (const [tmdbId, item] of globalItemsMap) {
    if (!cachedIds.has(tmdbId)) {
      itemsToRequest.push(item);
    }
  }

  logger.info(
    {
      globalUniqueItems,
      cachedItems: cachedIds.size,
      itemsToRequest: itemsToRequest.length,
    },
    'Cache check complete'
  );

  // PHASE 4: Request items to Jellyseerr
  logger.info('PHASE 4: Requesting items to Jellyseerr');

  let results = {
    successful: [] as Awaited<ReturnType<typeof fetchTraktList>>,
    failed: [] as Awaited<ReturnType<typeof fetchTraktList>>,
  };

  if (itemsToRequest.length > 0) {
    results = await requestItemsToJellyseerr(itemsToRequest, config);

    logger.info(
      {
        requested: itemsToRequest.length,
        successful: results.successful.length,
        failed: results.failed.length,
      },
      'Jellyseerr requests complete'
    );
  } else {
    logger.info('No new items to request');
  }

  // PHASE 5: Cache successful requests
  if (results.successful.length > 0) {
    logger.info('PHASE 5: Caching successful requests');

    // Use first list ID as reference (since cache is global)
    const referenceListId = listsWithItems[0]?.list.id || 1;
    await cacheRequestedItems(database, referenceListId, results.successful);
  }

  // PHASE 6: Update execution history for all lists
  logger.info('PHASE 6: Updating execution history');

  for (const { items, executionId } of listsWithItems) {
    // Calculate how many of this list's items were successfully requested
    const listTmdbIds = new Set(items.filter(i => i.tmdbId).map(i => i.tmdbId!));
    const successfulTmdbIds = new Set(results.successful.map(i => i.tmdbId));
    const listSuccessCount = [...listTmdbIds].filter(id => successfulTmdbIds.has(id)).length;

    await database
      .update(executionHistory)
      .set({
        completedAt: new Date(),
        status: 'success',
        itemsFound: items.length,
        itemsRequested: listSuccessCount,
        itemsFailed: 0, // Global failure count not attributed to individual lists
      })
      .where(eq(executionHistory.id, executionId));
  }

  const summary = {
    success: true,
    processedLists: listsWithItems.length,
    totalItemsFound,
    globalUniqueItems,
    cachedItems: cachedIds.size,
    itemsRequested: results.successful.length,
    itemsFailed: results.failed.length,
  };

  logger.info(
    summary,
    'Batch processing with global deduplication completed successfully'
  );

  return summary;
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
    // Use batch processing with global deduplication
    // Manual trigger since this is called from the UI
    const result = await processBatchWithDeduplication(ctx.db, 'manual');

    return {
      success: result.success,
      processedLists: result.processedLists,
      totalItemsFound: result.totalItemsFound,
      itemsRequested: result.itemsRequested,
      itemsFailed: result.itemsFailed,
    };
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
