import type { IMediaListRepository } from '../repositories/media-list.repository.interface';
import type { IListUrlParserService } from '../services/list-url-parser.service.interface';
import type { ISchedulerService } from '../services/scheduler.service.interface';
import type { ILogger } from '../services/logger.interface';
import { MediaList } from '../../domain/entities/media-list.entity';
import type { CreateMediaListCommand, CreateMediaListResponse } from '../dtos/media-list.command.dto';

export class CreateMediaListUseCase {
  constructor(
    private readonly mediaListRepository: IMediaListRepository,
    private readonly urlParserService: IListUrlParserService,
    private readonly schedulerService: ISchedulerService,
    private readonly logger: ILogger
  ) {}

  async execute(command: CreateMediaListCommand): Promise<CreateMediaListResponse> {
    // 1. Validate and parse URLs based on provider
    const { apiUrl, displayUrl } = this.urlParserService.parseUrlForProvider(
      command.url,
      command.provider,
      command.displayUrl
    );

    // 2. Create entity (with temporary ID 0, DB will assign real ID)
    const list = new MediaList({
      id: 0,
      userId: command.userId,
      name: command.name,
      url: apiUrl,
      displayUrl,
      provider: command.provider,
      enabled: command.enabled,
      maxItems: command.maxItems,
      processingSchedule: command.processingSchedule,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 3. Save entity to repository
    const savedList = await this.mediaListRepository.save(list);

    // 4. Log creation
    this.logger.info(
      {
        listId: savedList.id,
        listName: savedList.name.getValue(),
        provider: savedList.provider.getValue(),
        url: savedList.url.getValue(),
        maxItems: savedList.maxItems,
        enabled: savedList.enabled,
        schedule: savedList.processingSchedule || 'none',
      },
      'List created'
    );

    // 5. Reload scheduler if needed
    if (savedList.hasSchedule() && savedList.isProcessable()) {
      await this.schedulerService.loadScheduledLists();
      this.logger.info({ listId: savedList.id }, 'Scheduler reloaded for new list');
    }

    // 6. Convert entity to Response DTO
    return { list: savedList.toDTO() };
  }
}
