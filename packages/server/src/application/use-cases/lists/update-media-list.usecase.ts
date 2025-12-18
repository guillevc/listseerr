import type { IMediaListRepository } from '@/server/application/repositories/media-list.repository.interface';
import type { IListUrlParserService } from '@/server/application/services/list-url-parser.service.interface';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import { MediaListMapper } from '@/server/application/mappers/media-list.mapper';
import { ProviderVO } from '@/server/domain/value-objects/provider.vo';
import type { UpdateMediaListCommand } from 'shared/application/dtos/media-list/commands.dto';
import type { UpdateMediaListResponse } from 'shared/application/dtos/media-list/responses.dto';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import { MediaListNotFoundError } from 'shared/domain/errors/media-list.errors';
import { UrlDoesNotMatchProviderError } from 'shared/domain/errors/provider.errors';

export class UpdateMediaListUseCase implements IUseCase<
  UpdateMediaListCommand,
  UpdateMediaListResponse
> {
  constructor(
    private readonly mediaListRepository: IMediaListRepository,
    private readonly urlParserService: IListUrlParserService,
    private readonly logger: ILogger
  ) {}

  async execute(command: UpdateMediaListCommand): Promise<UpdateMediaListResponse> {
    // 1. Load entity from repository
    const list = await this.mediaListRepository.findById(command.id, command.userId);

    if (!list) {
      throw new MediaListNotFoundError(command.id);
    }

    // 2. Apply changes using entity mutation methods

    // Handle name change
    if (command.data.name !== undefined) {
      list.changeName(command.data.name);
    }

    // Handle URL and provider changes (with URL parsing)
    if (command.data.url !== undefined || command.data.provider !== undefined) {
      const providerValue = command.data.provider || list.provider.getValue();
      const provider = ProviderVO.create(providerValue);
      const url = command.data.url || list.url.getValue();

      // Validate URL matches provider for user-submitted URLs
      if ((provider.isTrakt() || provider.isMdbList()) && !provider.matchesUrl(url)) {
        throw new UrlDoesNotMatchProviderError(url, providerValue);
      }

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

    // 5. Convert entity to Response DTO
    return { list: MediaListMapper.toDTO(updatedList) };
  }
}
