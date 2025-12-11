import type { IMediaListRepository } from '../repositories/media-list.repository.interface';
import type { ISchedulerService } from '../services/scheduler.service.interface';
import type { ILogger } from '../services/logger.interface';
import type { ToggleListEnabledCommand } from '../../../shared/application/dtos/media-list/commands.dto';
import type { ToggleListEnabledResponse } from '../../../shared/application/dtos/media-list/responses.dto';

export class ToggleListEnabledUseCase {
  constructor(
    private readonly mediaListRepository: IMediaListRepository,
    private readonly schedulerService: ISchedulerService,
    private readonly logger: ILogger
  ) {}

  async execute(command: ToggleListEnabledCommand): Promise<ToggleListEnabledResponse> {
    // 1. Load entity
    const list = await this.mediaListRepository.findById(command.id, command.userId);

    if (!list) {
      throw new Error('List not found');
    }

    const oldState = list.enabled;

    // 2. Toggle enabled state using entity mutation method
    list.toggle();

    // 3. Save entity
    const updatedList = await this.mediaListRepository.save(list);

    // 4. Log state change
    this.logger.info(
      {
        listId: updatedList.id,
        listName: updatedList.name.getValue(),
        oldState: oldState ? 'enabled' : 'disabled',
        newState: updatedList.enabled ? 'enabled' : 'disabled',
      },
      updatedList.enabled ? 'List enabled' : 'List disabled'
    );

    // 5. Reload scheduler if list has a schedule
    if (updatedList.hasSchedule()) {
      await this.schedulerService.loadScheduledLists();
      this.logger.info({ listId: updatedList.id }, 'Scheduler reloaded for enabled state change');
    }

    // 6. Convert entity to Response DTO
    return { list: updatedList.toDTO() };
  }
}
