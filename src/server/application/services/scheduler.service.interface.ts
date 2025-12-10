export interface ISchedulerService {
  loadScheduledLists(): Promise<void>;
  unscheduleList(listId: number): void;
}
