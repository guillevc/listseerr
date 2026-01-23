import type { trpc } from './trpc';

type TRPCUtils = ReturnType<typeof trpc.useUtils>;

/**
 * Invalidate all list-related queries.
 * Use after creating, updating, or deleting lists.
 */
export function invalidateListQueries(utils: TRPCUtils): void {
  void utils.lists.getAll.invalidate();
  void utils.dashboard.getStats.invalidate();
  void utils.dashboard.getRecentActivity.invalidate();
}

/**
 * Invalidate all processing-related queries.
 * Use after processing lists (includes list queries + pending requests).
 */
export function invalidateProcessingQueries(utils: TRPCUtils): void {
  void utils.lists.getAll.invalidate();
  void utils.dashboard.getStats.invalidate();
  void utils.dashboard.getRecentActivity.invalidate();
  void utils.dashboard.getPendingRequests.invalidate();
}
