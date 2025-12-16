export interface ScheduledJob {
  name: string;
  cronExpression: string;
  nextRun: Date | null;
  isRunning: boolean;
}

export interface ISchedulerService {
  loadScheduledLists(): Promise<void>;
  unscheduleList(listId: number): void;
  getScheduledJobs(): ScheduledJob[];
}
