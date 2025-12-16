/**
 * Scheduler Info Service Interface
 *
 * Read-only service for querying scheduler state.
 * Separate from ISchedulerService to follow Single Responsibility Principle.
 *
 * Follows Dependency Inversion Principle:
 * - Interface defined in Application layer
 * - Implementation in Infrastructure layer (can be same adapter as ISchedulerService)
 */

export interface ScheduledJobInfo {
  listId: number;
  nextRun: string | null;
}

export interface ISchedulerInfoService {
  /**
   * Get all currently scheduled jobs
   */
  getScheduledJobs(): ScheduledJobInfo[];
}
