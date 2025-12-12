import type { IMediaListRepository } from '../../repositories/media-list.repository.interface';
import type { ISchedulerService } from '../../services/scheduler.service.interface';
import type { ILogger } from '../../services/logger.interface';
import type { DeleteMediaListCommand } from 'shared/application/dtos/media-list/commands.dto';
import type { DeleteMediaListResponse } from 'shared/application/dtos/media-list/responses.dto';
import type { IUseCase } from '../use-case.interface';
import { LogExecution } from '../../../infrastructure/services/core/decorators/log-execution.decorator';

export class DeleteMediaListUseCase implements IUseCase<
  DeleteMediaListCommand,
  DeleteMediaListResponse
> {
  constructor(
    private readonly mediaListRepository: IMediaListRepository,
    private readonly schedulerService: ISchedulerService,
    private readonly logger: ILogger
  ) {}

  @LogExecution('lists:delete')
  async execute(command: DeleteMediaListCommand): Promise<DeleteMediaListResponse> {
    // 1. Load entity
    const list = await this.mediaListRepository.findById(command.id, command.userId);

    if (!list) {
      throw new Error('List not found');
    }

    // 2. Log deletion
    this.logger.info(
      {
        listId: list.id,
        listName: list.name.getValue(),
        provider: list.provider.getValue(),
      },
      'List deleted'
    );

    // 3. Unschedule the list first
    this.schedulerService.unscheduleList(list.id);

    // 4. Delete entity from repository
    await this.mediaListRepository.delete(list);

    return { success: true };
  }
}
