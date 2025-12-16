import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import type {
  IDashboardStatsRepository,
  ExecutionWithListName,
} from '@/server/application/repositories/dashboard-stats.repository.interface';
import { executionHistory, mediaLists } from '@/server/infrastructure/db/schema';
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

  async getTotalRequestedItemsCount(_userId: number): Promise<number> {
    // Sum all requested items across all executions
    // Note: _userId reserved for future multitenancy
    const [result] = await this.db
      .select({ total: sql<number>`coalesce(sum(${executionHistory.itemsRequested}), 0)` })
      .from(executionHistory);

    return result?.total ?? 0;
  }

  async getLastScheduledExecution(_userId: number): Promise<Date | null> {
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
        itemsSkippedAvailable: executionHistory.itemsSkippedAvailable,
        itemsSkippedPreviouslyRequested: executionHistory.itemsSkippedPreviouslyRequested,
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
