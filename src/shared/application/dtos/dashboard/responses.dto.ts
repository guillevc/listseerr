import type { ExecutionDTO } from '../core/execution.dto';

/**
 * Dashboard Response DTOs
 *
 * Output contracts for dashboard-related operations.
 * Use cases return these wrapped DTOs directly to routers.
 */

export interface DashboardStatsResponse {
  totalRequestedItems: number;
  lastScheduledProcessing: Date | null;
  nextScheduledProcessing: string | null;
}

export interface ActivityGroup {
  timestamp: Date;
  triggerType: 'manual' | 'scheduled';
  executions: ExecutionDTO[];
}

export interface GetRecentActivityResponse {
  groups: ActivityGroup[];
}

export interface GetPendingRequestsResponse {
  count: number;
  configured: boolean;
  error: boolean;
}
