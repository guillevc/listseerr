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
 * Invalidate dashboard queries only.
 * Use when updating dashboard-specific data.
 */
export function invalidateDashboardQueries(utils: TRPCUtils): void {
  void utils.dashboard.getStats.invalidate();
  void utils.dashboard.getRecentActivity.invalidate();
}

/**
 * Invalidate all config-related queries.
 * Use after updating API keys or settings.
 */
export function invalidateConfigQueries(utils: TRPCUtils): void {
  void utils.traktConfig.get.invalidate();
  void utils.mdblistConfig.get.invalidate();
  void utils.config.get.invalidate();
}

/**
 * Invalidate Trakt config query.
 */
export function invalidateTraktConfig(utils: TRPCUtils): void {
  void utils.traktConfig.get.invalidate();
}

/**
 * Invalidate MDBList config query.
 */
export function invalidateMdbListConfig(utils: TRPCUtils): void {
  void utils.mdblistConfig.get.invalidate();
}

/**
 * Invalidate Jellyseerr config query.
 */
export function invalidateJellyseerrConfig(utils: TRPCUtils): void {
  void utils.config.get.invalidate();
}

/**
 * Invalidate general settings query.
 */
export function invalidateGeneralSettings(utils: TRPCUtils): void {
  void utils.generalSettings.get.invalidate();
}
