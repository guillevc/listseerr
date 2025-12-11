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

export interface ExecutionDTO {
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
