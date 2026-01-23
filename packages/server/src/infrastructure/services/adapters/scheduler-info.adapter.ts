import type {
  ISchedulerInfoService,
  ScheduledJobInfo,
} from '@/server/application/services/core/scheduler-info.service.interface';
import { getSchedulerService } from '@/server/bootstrap/scheduler';

/**
 * SchedulerInfoAdapter
 *
 * Infrastructure adapter that lazily resolves the scheduler service for read-only queries.
 * Implements ISchedulerInfoService interface.
 *
 * Implementation Details:
 * - Uses lazy resolution to get scheduler service at runtime
 * - Returns minimal job info (listId, nextRun)
 * - Read-only operations only
 */
export class SchedulerInfoAdapter implements ISchedulerInfoService {
  getScheduledJobs(): ScheduledJobInfo[] {
    const schedulerService = getSchedulerService();
    const jobs = schedulerService.getScheduledJobs();

    // Transform ScheduledJob[] to ScheduledJobInfo[]
    return jobs.map((job) => ({
      listId: 0, // Global job ID
      nextRun: job.nextRun ? job.nextRun.toISOString() : null,
    }));
  }
}
