import type {
  ISchedulerService,
  ScheduledJob,
} from '../../application/services/scheduler.service.interface';
import { scheduler } from '../../lib/scheduler';

export class SchedulerService implements ISchedulerService {
  async loadScheduledLists(): Promise<void> {
    await scheduler.loadScheduledLists();
  }

  unscheduleList(listId: number): void {
    scheduler.unscheduleList(listId);
  }

  getScheduledJobs(): ScheduledJob[] {
    const jobs = scheduler.getScheduledJobs();

    // Transform to richer DTO format
    return jobs.map((job) => ({
      name: `List ${job.listId}`,
      cronExpression: '', // Not available from current scheduler implementation
      nextRun: job.nextRun ? new Date(job.nextRun) : null,
      isRunning: false, // Not tracked in current scheduler implementation
    }));
  }
}
