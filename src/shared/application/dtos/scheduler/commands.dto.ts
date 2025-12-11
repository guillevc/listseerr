/**
 * Scheduler Command DTOs
 *
 * Input contracts for scheduler-related operations.
 * Used by tRPC routers to pass validated data to use cases.
 */

export interface GetScheduledJobsCommand {
  userId: number;
}

export interface ReloadSchedulerCommand {
  userId: number;
}
