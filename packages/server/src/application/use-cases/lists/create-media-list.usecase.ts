import type { IMediaListRepository } from '@/server/application/repositories/media-list.repository.interface';
import type { IListUrlParserService } from '@/server/application/services/list-url-parser.service.interface';
import type { ISchedulerService } from '@/server/application/services/scheduler.service.interface';
import type { ILogger } from '@/server/application/services/logger.interface';
import { MediaList } from '@/server/domain/entities/media-list.entity';
import { MediaListMapper } from '@/server/application/mappers/media-list.mapper';
import { ProviderVO } from 'shared/domain/value-objects/provider.vo';
import { ListNameVO } from 'shared/domain/value-objects/list-name.vo';
import { ListUrlVO } from 'shared/domain/value-objects/list-url.vo';
import type { CreateMediaListCommand } from 'shared/application/dtos/media-list/commands.dto';
import type { CreateMediaListResponse } from 'shared/application/dtos/media-list/responses.dto';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

export class CreateMediaListUseCase implements IUseCase<
  CreateMediaListCommand,
  CreateMediaListResponse
> {
  constructor(
    private readonly mediaListRepository: IMediaListRepository,
    private readonly urlParserService: IListUrlParserService,
    private readonly schedulerService: ISchedulerService,
    private readonly logger: ILogger
  ) {}

  async execute(command: CreateMediaListCommand): Promise<CreateMediaListResponse> {
    // 1. Validate provider and parse URLs
    const provider = ProviderVO.create(command.provider);
    const { apiUrl, displayUrl } = this.urlParserService.parseUrlForProvider(
      command.url,
      provider,
      command.displayUrl
    );

    // 2. Create entity (with temporary ID 0, DB will assign real ID)
    const list = new MediaList({
      id: 0,
      userId: command.userId,
      name: ListNameVO.create(command.name),
      url: ListUrlVO.create(apiUrl),
      displayUrl,
      provider,
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
    return { list: MediaListMapper.toDTO(savedList) };
  }
}
