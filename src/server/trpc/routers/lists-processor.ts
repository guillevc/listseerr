import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { mediaLists, executionHistory, jellyseerrConfigs } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';

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

      // TODO: Implement actual processing logic (check lists + request new media)
      // For now, return a mock result
      try {
        // Simulate processing
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update execution history
        await ctx.db
          .update(executionHistory)
          .set({
            completedAt: new Date(),
            status: 'success',
            itemsFound: 0,
            itemsRequested: 0,
          })
          .where(eq(executionHistory.id, executionEntry.id));

        return {
          success: true,
          itemCount: 0,
          requestedCount: 0,
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

        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
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
