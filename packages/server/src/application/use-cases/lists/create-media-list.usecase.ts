import type { IMediaListRepository } from '@/server/application/repositories/media-list.repository.interface';
import type { IListUrlParserService } from '@/server/application/services/list-url-parser.service.interface';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import { MediaList } from '@/server/domain/entities/media-list.entity';
import { MediaListMapper } from '@/server/application/mappers/media-list.mapper';
import { ProviderVO } from '@/server/domain/value-objects/provider.vo';
import type { CreateMediaListCommand } from 'shared/application/dtos';
import type { CreateMediaListResponse } from 'shared/application/dtos';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import { UrlDoesNotMatchProviderError } from 'shared/domain/errors';

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
    const list = MediaList.create({
      userId: command.userId,
      name: command.name,
      url: apiUrl,
      displayUrl,
      provider: command.provider,
      enabled: command.enabled,
      maxItems: command.maxItems,
      seerrUserIdOverride: command.seerrUserIdOverride,
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
