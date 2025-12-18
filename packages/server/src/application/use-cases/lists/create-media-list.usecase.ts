import type { IMediaListRepository } from '@/server/application/repositories/media-list.repository.interface';
import type { IListUrlParserService } from '@/server/application/services/list-url-parser.service.interface';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import { MediaList } from '@/server/domain/entities/media-list.entity';
import { MediaListMapper } from '@/server/application/mappers/media-list.mapper';
import { ProviderVO } from 'shared/domain/value-objects/provider.vo';
import { ListNameVO } from 'shared/domain/value-objects/list-name.vo';
import { ListUrlVO } from 'shared/domain/value-objects/list-url.vo';
import type { CreateMediaListCommand } from 'shared/application/dtos/media-list/commands.dto';
import type { CreateMediaListResponse } from 'shared/application/dtos/media-list/responses.dto';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import { UrlDoesNotMatchProviderError } from 'shared/domain/errors/provider.errors';

export class CreateMediaListUseCase implements IUseCase<
  CreateMediaListCommand,
  CreateMediaListResponse
> {
  constructor(
    private readonly mediaListRepository: IMediaListRepository,
    private readonly urlParserService: IListUrlParserService,
    private readonly logger: ILogger
  ) {}

  async execute(command: CreateMediaListCommand): Promise<CreateMediaListResponse> {
    // 1. Validate provider and URL match
    const provider = ProviderVO.create(command.provider);
    if ((provider.isTrakt() || provider.isMdbList()) && !provider.matchesUrl(command.url)) {
      throw new UrlDoesNotMatchProviderError(command.url, command.provider);
    }

    // 2. Parse URLs
    const { apiUrl, displayUrl } = this.urlParserService.parseUrlForProvider(
      command.url,
      provider,
      command.displayUrl
    );

    // 3. Create entity (with temporary ID 0, DB will assign real ID)
    const list = new MediaList({
      id: 0,
      userId: command.userId,
      name: ListNameVO.create(command.name),
      url: ListUrlVO.create(apiUrl),
      displayUrl,
      provider,
      enabled: command.enabled,
      maxItems: command.maxItems,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 4. Save entity to repository
    const savedList = await this.mediaListRepository.save(list);

    // 5. Log creation
    this.logger.info(
      {
        listId: savedList.id,
        listName: savedList.name.getValue(),
        provider: savedList.provider.getValue(),
        url: savedList.url.getValue(),
        maxItems: savedList.maxItems,
        enabled: savedList.enabled,
      },
      'List created'
    );

    // 6. Convert entity to Response DTO
    return { list: MediaListMapper.toDTO(savedList) };
  }
}
