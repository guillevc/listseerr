import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import type {
  IDashboardStatsRepository,
  ExecutionWithListName,
} from '@/server/application/repositories/dashboard-stats.repository.interface';
import { executionHistory, listItemsCache, mediaLists } from '@/server/infrastructure/db/schema';
import * as schema from '@/server/infrastructure/db/schema';

/**
 * DrizzleDashboardStatsRepository
 *
 * Infrastructure implementation of dashboard stats repository using Drizzle ORM.
 * Handles complex SQL queries with aggregations and JOINs.
 *
 * Implementation Details:
 * - Uses SQL aggregations for total counts
 * - JOINs execution history with media lists for names
 * - Filters by time ranges (last 24h)
 */
export class DrizzleDashboardStatsRepository implements IDashboardStatsRepository {
  constructor(private readonly db: BunSQLiteDatabase<typeof schema>) {}

  async getTotalRequestedItemsCount(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userId: number
  ): Promise<number> {
    // Count distinct TMDB IDs across all cached list items
    // Note: _userId reserved for future multitenancy
    const [result] = await this.db
      .select({ count: sql<number>`count(distinct ${listItemsCache.tmdbId})` })
      .from(listItemsCache);

    return result?.count || 0;
  }

  async getLastScheduledExecution(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userId: number
  ): Promise<Date | null> {
    // Get most recent successful scheduled execution
    // Note: _userId reserved for future multitenancy
    const [result] = await this.db
      .select({ completedAt: executionHistory.completedAt })
      .from(executionHistory)
      .where(
        and(eq(executionHistory.triggerType, 'scheduled'), eq(executionHistory.status, 'success'))
      )
      .orderBy(desc(executionHistory.completedAt))
      .limit(1);

    return result?.completedAt || null;
  }

  async getRecentExecutionsWithListNames(
    _userId: number,
    limit: number
  ): Promise<ExecutionWithListName[]> {
    // Filter to last 24 hours only
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get recent executions with list names via LEFT JOIN
    // Note: _userId reserved for future multitenancy
    const results = await this.db
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
      .limit(limit);

    return results;
  }
}
