import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { mediaLists, executionHistory, jellyseerrConfigs, providerConfigs } from '../../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { fetchTraktList } from '../../services/trakt/client';
import { requestItemsToJellyseerr } from '../../services/jellyseerr/client';
import { getAlreadyRequestedIds, cacheRequestedItems } from '../../services/list-processor/deduplicator';

export const listsProcessorRouter = router({
  processList: publicProcedure
    .input(z.object({ listId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Get the list
      const [list] = await ctx.db
        .select()
        .from(mediaLists)
        .where(eq(mediaLists.id, input.listId))
        .limit(1);

      if (!list) {
        throw new Error('List not found');
      }

      if (!list.enabled) {
        throw new Error('List is disabled');
      }

      // Get Jellyseerr config
      const [config] = await ctx.db
        .select()
        .from(jellyseerrConfigs)
        .where(eq(jellyseerrConfigs.userId, 1))
        .limit(1);

      if (!config) {
        throw new Error('Jellyseerr configuration not found');
      }

      // Create execution history entry
      const [executionEntry] = await ctx.db
        .insert(executionHistory)
        .values({
          listId: list.id,
          startedAt: new Date(),
          status: 'running',
        })
        .returning();

      try {
        // Get Trakt client ID from provider configs
        const [traktConfig] = await ctx.db
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
        console.log(`Fetching items from Trakt list: ${list.url}`);
        const traktItems = await fetchTraktList(
          list.url,
          list.maxItems,
          traktConfig.clientId
        );

        console.log(`Found ${traktItems.length} items from Trakt`);

        // Load cache and filter out already-requested items
        const cachedIds = await getAlreadyRequestedIds(ctx.db, list.id);
        const newItems = traktItems.filter(
          (item) => item.tmdbId && !cachedIds.has(item.tmdbId)
        );

        console.log(`${newItems.length} new items to request (${cachedIds.size} already cached)`);

        // Request new items to Jellyseerr
        const results = await requestItemsToJellyseerr(newItems, config);

        console.log(
          `Requested ${results.successful.length} items successfully, ${results.failed.length} failed`
        );

        // Cache successful requests
        await cacheRequestedItems(ctx.db, list.id, results.successful);

        // Update execution history
        await ctx.db
          .update(executionHistory)
          .set({
            completedAt: new Date(),
            status: 'success',
            itemsFound: traktItems.length,
            itemsRequested: results.successful.length,
          })
          .where(eq(executionHistory.id, executionEntry.id));

        return {
          success: true,
          itemsFound: traktItems.length,
          itemsRequested: results.successful.length,
          itemsFailed: results.failed.length,
        };
      } catch (error) {
        // Update execution history with error
        await ctx.db
          .update(executionHistory)
          .set({
            completedAt: new Date(),
            status: 'error',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          })
          .where(eq(executionHistory.id, executionEntry.id));

        throw error;
      }
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
