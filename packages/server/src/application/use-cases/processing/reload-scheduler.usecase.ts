import type { ISchedulerService } from '../../services/scheduler.service.interface';
import type { ReloadSchedulerCommand } from 'shared/application/dtos/scheduler/commands.dto';
import type { ReloadSchedulerResponse } from 'shared/application/dtos/scheduler/responses.dto';
import type { IUseCase } from '../use-case.interface';
import { LogExecution } from '../../../infrastructure/services/core/decorators/log-execution.decorator';

/**
 * ReloadSchedulerUseCase
 *
 * Reloads all scheduled jobs from the database.
 * Unschedules existing jobs and reschedules based on current list configurations.
 *
 * Business Rules:
 * - Idempotent: Safe to call multiple times
 * - Ensures scheduler state matches database state
 * - Used after list schedule changes
 */
export class ReloadSchedulerUseCase implements IUseCase<
  ReloadSchedulerCommand,
  ReloadSchedulerResponse
> {
  constructor(private readonly schedulerService: ISchedulerService) {}

  @LogExecution('scheduler:reload')
  async execute(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _command: ReloadSchedulerCommand
  ): Promise<ReloadSchedulerResponse> {
    // Note: _command.userId reserved for future multitenancy validation
    await this.schedulerService.loadScheduledLists();

    return {
      success: true,
      message: 'Scheduler reloaded successfully',
    };
  }
}
