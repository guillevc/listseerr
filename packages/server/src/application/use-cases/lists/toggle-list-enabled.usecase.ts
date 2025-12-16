import type { IMediaListRepository } from '@/server/application/repositories/media-list.repository.interface';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import { MediaListMapper } from '@/server/application/mappers/media-list.mapper';
import type { ToggleListEnabledCommand } from 'shared/application/dtos/media-list/commands.dto';
import type { ToggleListEnabledResponse } from 'shared/application/dtos/media-list/responses.dto';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

export class ToggleListEnabledUseCase implements IUseCase<
  ToggleListEnabledCommand,
  ToggleListEnabledResponse
> {
  constructor(
    private readonly mediaListRepository: IMediaListRepository,
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

    // 5. Convert entity to Response DTO
    return { list: MediaListMapper.toDTO(updatedList) };
  }
}
