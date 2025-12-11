/**
 * Dashboard Command DTOs
 *
 * Input contracts for dashboard-related operations.
 * Used by tRPC routers to pass validated data to use cases.
 */

export interface GetDashboardStatsCommand {
  userId: number;
}

export interface GetRecentActivityCommand {
  userId: number;
  limit: number;
}

export interface GetPendingRequestsCommand {
  userId: number;
}
