import type { ISchedulerService } from '../services/scheduler.service.interface';
import type { ReloadSchedulerCommand } from '../dtos/scheduler.command.dto';
import type { ReloadSchedulerResponse } from '../dtos/scheduler.response.dto';

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
export class ReloadSchedulerUseCase {
  constructor(
    private readonly schedulerService: ISchedulerService
  ) {}

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
