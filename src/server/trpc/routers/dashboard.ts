import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { executionHistory, listItemsCache, mediaLists, jellyseerrConfigs } from '../../db/schema';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import { scheduler } from '../../lib/scheduler';
import { getPendingRequestsCount } from '../../services/jellyseerr/client';
import { createLogger } from '../../lib/logger';

const logger = createLogger('dashboard');

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
      // Filter to last 24 hours only
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Get recent executions with list names
      const recentExecutions = await ctx.db
        .select({
          id: executionHistory.id,
          listId: executionHistory.listId,
          listName: mediaLists.name,
          batchId: executionHistory.batchId,
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
        .where(gte(executionHistory.startedAt, twentyFourHoursAgo))
        .orderBy(desc(executionHistory.startedAt))
        .limit(input.limit);

      // Group executions by batchId (if present) or by time proximity
      // batchId groups "Process All" operations together regardless of time
      // Time-based grouping (within 1 minute) is used for individual list processing
      const grouped: Array<{
        timestamp: Date;
        triggerType: 'manual' | 'scheduled';
        executions: typeof recentExecutions;
      }> = [];

      for (const execution of recentExecutions) {
        let addedToGroup = false;

        // If execution has a batchId, try to find existing group with same batchId
        if (execution.batchId) {
          const batchGroup = grouped.find(
            g => g.executions[0]?.batchId === execution.batchId
          );

          if (batchGroup) {
            batchGroup.executions.push(execution);
            addedToGroup = true;
          }
        }

        // If not added to a batch group, try time-based grouping
        if (!addedToGroup) {
          const lastGroup = grouped[grouped.length - 1];

          if (lastGroup && !lastGroup.executions[0]?.batchId) {
            // Only try time-based grouping if last group is also not a batch
            const firstExecutionInGroup = lastGroup.executions[0];
            const timeDiff = Math.abs(execution.startedAt.getTime() - firstExecutionInGroup.startedAt.getTime());

            if (
              lastGroup.triggerType === execution.triggerType &&
              timeDiff < 60000 // 1 minute
            ) {
              lastGroup.executions.push(execution);
              addedToGroup = true;
            }
          }
        }

        // If still not added to any group, create a new group
        if (!addedToGroup) {
          grouped.push({
            timestamp: execution.startedAt,
            triggerType: execution.triggerType,
            executions: [execution],
          });
        }
      }

      return grouped;
    }),

  getPendingRequests: publicProcedure.query(async ({ ctx }) => {
    // Get Jellyseerr config
    const [config] = await ctx.db
      .select()
      .from(jellyseerrConfigs)
      .where(eq(jellyseerrConfigs.userId, 1))
      .limit(1);

    // If no config, return not configured state
    if (!config) {
      return { count: 0, configured: false, error: false };
    }

    // Call getPendingRequestsCount()
    try {
      const count = await getPendingRequestsCount(config);
      return { count, configured: true, error: false };
    } catch (error) {
      logger.error({ error }, 'Failed to fetch pending requests count');
      return { count: 0, configured: true, error: true };
    }
  }),
});
