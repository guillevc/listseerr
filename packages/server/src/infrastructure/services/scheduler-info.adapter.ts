import type {
  ISchedulerInfoService,
  ScheduledJobInfo,
} from '../../application/services/scheduler-info.service.interface';
import { scheduler } from '../../infrastructure/services/scheduler.service';

/**
 * SchedulerInfoAdapter
 *
 * Infrastructure adapter that wraps the scheduler singleton for read-only queries.
 * Implements ISchedulerInfoService interface.
 *
 * Implementation Details:
 * - Wraps scheduler.getScheduledJobs() method
 * - Returns minimal job info (listId, nextRun)
 * - Read-only operations only
 */
export class SchedulerInfoAdapter implements ISchedulerInfoService {
  getScheduledJobs(): ScheduledJobInfo[] {
    return scheduler.getScheduledJobs();
  }
}
