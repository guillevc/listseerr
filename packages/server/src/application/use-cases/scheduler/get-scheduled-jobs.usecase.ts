import type { ISchedulerService } from '@/application/services/scheduler.service.interface';
import type { GetScheduledJobsCommand } from 'shared/application/dtos/scheduler/commands.dto';
import type { GetScheduledJobsResponse } from 'shared/application/dtos/scheduler/responses.dto';
import type { IUseCase } from '@/application/use-cases/use-case.interface';
import { LogExecution } from '@/infrastructure/services/core/decorators/log-execution.decorator';

/**
 * GetScheduledJobsUseCase
 *
 * Retrieves all currently scheduled jobs from the scheduler.
 *
 * Business Rules:
 * - Returns job metadata (name, cron expression, next run time, running status)
 * - Read-only operation, no side effects
 */
export class GetScheduledJobsUseCase implements IUseCase<
  GetScheduledJobsCommand,
  GetScheduledJobsResponse
> {
  constructor(private readonly schedulerService: ISchedulerService) {}

  @LogExecution('scheduler:get-jobs')
  async execute(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _command: GetScheduledJobsCommand
  ): Promise<GetScheduledJobsResponse> {
    // Note: _command.userId reserved for future multitenancy validation
    const jobs = this.schedulerService.getScheduledJobs();

    return { jobs };
  }
}
