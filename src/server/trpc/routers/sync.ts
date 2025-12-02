import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { mediaLists, syncHistory, jellyseerrConfigs } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';

export const syncRouter = router({
  syncList: publicProcedure
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

      // Create sync history entry
      const [syncEntry] = await ctx.db
        .insert(syncHistory)
        .values({
          listId: list.id,
          startedAt: new Date(),
          status: 'running',
        })
        .returning();

      // TODO: Implement actual sync logic with list providers
      // For now, return a mock result
      try {
        // Simulate sync
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update sync history
        await ctx.db
          .update(syncHistory)
          .set({
            completedAt: new Date(),
            status: 'success',
            itemsFound: 0,
            itemsRequested: 0,
          })
          .where(eq(syncHistory.id, syncEntry.id));

        return {
          success: true,
          itemCount: 0,
          requestedCount: 0,
        };
      } catch (error) {
        // Update sync history with error
        await ctx.db
          .update(syncHistory)
          .set({
            completedAt: new Date(),
            status: 'error',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          })
          .where(eq(syncHistory.id, syncEntry.id));

        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  syncAll: publicProcedure.mutation(async ({ ctx }) => {
    // Get all enabled lists
    const lists = await ctx.db
      .select()
      .from(mediaLists)
      .where(eq(mediaLists.enabled, true));

    const results = [];
    for (const list of lists) {
      // This would trigger individual syncs
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
        .from(syncHistory)
        .where(eq(syncHistory.listId, input.listId))
        .orderBy(desc(syncHistory.startedAt))
        .limit(input.limit);

      return history;
    }),
});
