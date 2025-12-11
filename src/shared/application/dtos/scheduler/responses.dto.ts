import type { ScheduledJobDTO } from '../core/scheduled-job.dto';

/**
 * Scheduler Response DTOs
 *
 * Output contracts for scheduler-related operations.
 * Use cases return these wrapped DTOs directly to routers.
 */

export interface GetScheduledJobsResponse {
  jobs: ScheduledJobDTO[];
}

export interface ReloadSchedulerResponse {
  success: boolean;
  message: string;
}
