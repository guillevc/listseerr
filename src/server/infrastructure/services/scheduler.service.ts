import type { ISchedulerService } from '../../application/services/scheduler.service.interface';
import { scheduler } from '../../lib/scheduler';

export class SchedulerService implements ISchedulerService {
  async loadScheduledLists(): Promise<void> {
    await scheduler.loadScheduledLists();
  }

  unscheduleList(listId: number): void {
    scheduler.unscheduleList(listId);
  }
}
