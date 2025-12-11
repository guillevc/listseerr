/**
 * Dashboard Stats Repository Interface
 *
 * Specialized read-only repository for dashboard statistics.
 * Doesn't follow entity-based repository pattern since it deals with aggregations.
 *
 * Follows Dependency Inversion Principle:
 * - Interface defined in Application layer
 * - Implementation in Infrastructure layer
 */

export interface ExecutionWithListName {
  id: number;
  listId: number | null;
  listName: string | null;
  batchId: string | null;
  startedAt: Date;
  completedAt: Date | null;
  status: 'running' | 'success' | 'error';
  triggerType: 'manual' | 'scheduled';
  itemsFound: number | null;
  itemsRequested: number | null;
  itemsFailed: number | null;
  errorMessage: string | null;
}

export interface IDashboardStatsRepository {
  /**
   * Get count of distinct TMDB IDs across all cached list items
   */
  getTotalRequestedItemsCount(userId: number): Promise<number>;

  /**
   * Get most recent successful scheduled execution
   */
  getLastScheduledExecution(userId: number): Promise<Date | null>;

  /**
   * Get recent executions (last 24h) with associated list names
   */
  getRecentExecutionsWithListNames(userId: number, limit: number): Promise<ExecutionWithListName[]>;
}
