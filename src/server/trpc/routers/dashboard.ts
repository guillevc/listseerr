import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { executionHistory, listItemsCache, mediaLists } from '../../db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

export const dashboardRouter = router({
  getStats: publicProcedure.query(async ({ ctx }) => {
    // Get total requested items count from cache
    const [cacheCount] = await ctx.db
      .select({ count: sql<number>`count(distinct ${listItemsCache.tmdbId})` })
      .from(listItemsCache);

    // Get last scheduled processing time
    const [lastScheduled] = await ctx.db
      .select({ completedAt: executionHistory.completedAt })
      .from(executionHistory)
      .where(
        and(
          eq(executionHistory.triggerType, 'scheduled'),
          eq(executionHistory.status, 'success')
        )
      )
      .orderBy(desc(executionHistory.completedAt))
      .limit(1);

    return {
      totalRequestedItems: cacheCount?.count || 0,
      lastScheduledProcessing: lastScheduled?.completedAt || null,
    };
  }),

  getRecentActivity: publicProcedure
    .input(
      z.object({
        limit: z.number().positive().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get recent executions with list names
      const recentExecutions = await ctx.db
        .select({
          id: executionHistory.id,
          listId: executionHistory.listId,
          listName: mediaLists.name,
          startedAt: executionHistory.startedAt,
          completedAt: executionHistory.completedAt,
          status: executionHistory.status,
          triggerType: executionHistory.triggerType,
          itemsFound: executionHistory.itemsFound,
          itemsRequested: executionHistory.itemsRequested,
          itemsFailed: executionHistory.itemsFailed,
          errorMessage: executionHistory.errorMessage,
        })
        .from(executionHistory)
        .leftJoin(mediaLists, eq(executionHistory.listId, mediaLists.id))
        .orderBy(desc(executionHistory.startedAt))
        .limit(input.limit);

      // Group by minute if they were triggered by scheduler (batch processing)
      const grouped: Array<{
        timestamp: Date;
        triggerType: 'manual' | 'scheduled';
        executions: typeof recentExecutions;
      }> = [];

      for (const execution of recentExecutions) {
        if (execution.triggerType === 'manual') {
          // Manual executions are always standalone
          grouped.push({
            timestamp: execution.startedAt,
            triggerType: 'manual',
            executions: [execution],
          });
        } else {
          // For scheduled executions, group those within 1 minute of each other
          const lastGroup = grouped[grouped.length - 1];
          const timeDiff = lastGroup
            ? Math.abs(execution.startedAt.getTime() - lastGroup.timestamp.getTime())
            : Infinity;

          if (
            lastGroup &&
            lastGroup.triggerType === 'scheduled' &&
            timeDiff < 60000 // 1 minute
          ) {
            // Add to existing group
            lastGroup.executions.push(execution);
          } else {
            // Create new group
            grouped.push({
              timestamp: execution.startedAt,
              triggerType: 'scheduled',
              executions: [execution],
            });
          }
        }
      }

      return grouped;
    }),
});
