import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { executionHistory, listItemsCache, mediaLists } from '../../db/schema';
import { eq, desc, sql, and } from 'drizzle-orm';
import { scheduler } from '../../lib/scheduler';

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

    // Get next scheduled processing time from scheduler
    // Global automatic processing job has listId: 0
    const scheduledJobs = scheduler.getScheduledJobs();
    const globalJob = scheduledJobs.find(job => job.listId === 0);
    const nextScheduledProcessing = globalJob?.nextRun || null;

    return {
      totalRequestedItems: cacheCount?.count || 0,
      lastScheduledProcessing: lastScheduled?.completedAt || null,
      nextScheduledProcessing,
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

      // Group executions that occur within 1 minute of each other
      // This groups both scheduled processing and manual "Process all" operations
      const grouped: Array<{
        timestamp: Date;
        triggerType: 'manual' | 'scheduled';
        executions: typeof recentExecutions;
      }> = [];

      for (const execution of recentExecutions) {
        // Check if we can add to the last group
        const lastGroup = grouped[grouped.length - 1];
        const timeDiff = lastGroup
          ? Math.abs(execution.startedAt.getTime() - lastGroup.timestamp.getTime())
          : Infinity;

        if (
          lastGroup &&
          lastGroup.triggerType === execution.triggerType &&
          timeDiff < 60000 // 1 minute
        ) {
          // Add to existing group if same trigger type and within 1 minute
          lastGroup.executions.push(execution);
        } else {
          // Create new group
          grouped.push({
            timestamp: execution.startedAt,
            triggerType: execution.triggerType,
            executions: [execution],
          });
        }
      }

      return grouped;
    }),
});
