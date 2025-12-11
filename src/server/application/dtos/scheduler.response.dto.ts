/**
 * Scheduler Response DTOs
 *
 * Output contracts for scheduler-related operations.
 * Use cases return these wrapped DTOs directly to routers.
 */

export interface ScheduledJobDTO {
  name: string;
  cronExpression: string;
  nextRun: Date | null;
  isRunning: boolean;
}

export interface GetScheduledJobsResponse {
  jobs: ScheduledJobDTO[];
}

export interface ReloadSchedulerResponse {
  success: boolean;
  message: string;
}
