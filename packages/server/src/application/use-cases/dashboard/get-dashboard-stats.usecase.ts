import type { IDashboardStatsRepository } from '../../repositories/dashboard-stats.repository.interface';
import type { ISchedulerInfoService } from '../../services/scheduler-info.service.interface';
import type { GetDashboardStatsCommand } from 'shared/application/dtos/dashboard/commands.dto';
import type { DashboardStatsResponse } from 'shared/application/dtos/dashboard/responses.dto';
import type { IUseCase } from '../use-case.interface';

/**
 * GetDashboardStatsUseCase
 *
 * Aggregates dashboard statistics from multiple sources:
 * - Total requested items (from cache repository)
 * - Last scheduled processing time (from execution history)
 * - Next scheduled processing time (from scheduler)
 *
 * Business Rules:
 * - Shows count of unique TMDB IDs across all lists
 * - Only shows successful scheduled executions for "last processing"
 * - Next processing is from global automatic processing job (listId: 0)
 */
export class GetDashboardStatsUseCase implements IUseCase<
  GetDashboardStatsCommand,
  DashboardStatsResponse
> {
  constructor(
    private readonly dashboardStatsRepository: IDashboardStatsRepository,
    private readonly schedulerInfoService: ISchedulerInfoService
  ) {}

  async execute(command: GetDashboardStatsCommand): Promise<DashboardStatsResponse> {
    // Get total requested items count
    const totalRequestedItems = await this.dashboardStatsRepository.getTotalRequestedItemsCount(
      command.userId
    );

    // Get last scheduled processing time
    const lastScheduledProcessing = await this.dashboardStatsRepository.getLastScheduledExecution(
      command.userId
    );

    // Get next scheduled processing time from scheduler
    // Global automatic processing job has listId: 0
    const scheduledJobs = this.schedulerInfoService.getScheduledJobs();
    const globalJob = scheduledJobs.find((job) => job.listId === 0);
    const nextScheduledProcessing = globalJob?.nextRun || null;

    return {
      totalRequestedItems,
      lastScheduledProcessing,
      nextScheduledProcessing,
    };
  }
}
