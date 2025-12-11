import type { IMediaListRepository } from '../repositories/media-list.repository.interface';
import type { IListUrlParserService } from '../services/list-url-parser.service.interface';
import type { ISchedulerService } from '../services/scheduler.service.interface';
import type { ILogger } from '../services/logger.interface';
import { Provider } from 'shared/domain/value-objects/provider.value-object';
import type { UpdateMediaListCommand } from 'shared/application/dtos/media-list/commands.dto';
import type { UpdateMediaListResponse } from 'shared/application/dtos/media-list/responses.dto';

export class UpdateMediaListUseCase {
  constructor(
    private readonly mediaListRepository: IMediaListRepository,
    private readonly urlParserService: IListUrlParserService,
    private readonly schedulerService: ISchedulerService,
    private readonly logger: ILogger
  ) {}

  async execute(command: UpdateMediaListCommand): Promise<UpdateMediaListResponse> {
    // 1. Load entity from repository
    const list = await this.mediaListRepository.findById(command.id, command.userId);

    if (!list) {
      throw new Error('List not found');
    }

    // 2. Apply changes using entity mutation methods

    // Handle name change
    if (command.data.name !== undefined) {
      list.changeName(command.data.name);
    }

    // Handle URL and provider changes (with URL parsing)
    if (command.data.url !== undefined || command.data.provider !== undefined) {
      const providerValue = command.data.provider || list.provider.getValue();
      const provider = Provider.create(providerValue);
      const url = command.data.url || list.url.getValue();

      const { apiUrl, displayUrl } = this.urlParserService.parseUrlForProvider(
        url,
        provider,
        command.data.displayUrl
      );

      if (command.data.url !== undefined) {
        list.changeUrl(apiUrl);
      }
      if (command.data.displayUrl !== undefined || displayUrl !== list.displayUrl) {
        list.changeDisplayUrl(displayUrl);
      }
      if (command.data.provider !== undefined) {
        list.changeProvider(command.data.provider);
      }
    }

    // Handle enabled state change
    if (command.data.enabled !== undefined) {
      if (command.data.enabled) {
        list.enable();
      } else {
        list.disable();
      }
    }

    // Handle max items change
    if (command.data.maxItems !== undefined) {
      list.changeMaxItems(command.data.maxItems);
    }

    // Handle schedule change
    if (command.data.processingSchedule !== undefined) {
      list.changeSchedule(command.data.processingSchedule);
    }

    // 3. Save entity
    const updatedList = await this.mediaListRepository.save(list);

    // 4. Log update
    this.logger.info(
      {
        listId: updatedList.id,
        listName: updatedList.name.getValue(),
        changes: command.data,
      },
      'List updated'
    );

    // 5. Reload scheduler if schedule-related fields were updated
    if (updatedList.requiresSchedulerReload(command.data)) {
      await this.schedulerService.loadScheduledLists();
      this.logger.info({ listId: updatedList.id }, 'Scheduler reloaded for list update');
    }

    // 6. Convert entity to Response DTO
    return { list: updatedList.toDTO() };
  }
}
