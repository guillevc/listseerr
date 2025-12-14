import type { IMediaListRepository } from '@/server/application/repositories/media-list.repository.interface';
import type { IJellyseerrConfigRepository } from '@/server/application/repositories/jellyseerr-config.repository.interface';
import type { IExecutionHistoryRepository } from '@/server/application/repositories/execution-history.repository.interface';
import type { ICacheRepository } from '@/server/application/repositories/cache.repository.interface';
import type { IMediaFetcherFactory } from '@/server/application/services/media-fetcher-factory.service.interface';
import type { IJellyseerrClient } from '@/server/application/services/jellyseerr-client.service.interface';
import { ProcessingExecutionMapper } from '@/server/application/mappers/processing-execution.mapper';
import type { ProcessListCommand } from 'shared/application/dtos/processing/commands.dto';
import type { ProcessListResponse } from 'shared/application/dtos/processing/responses.dto';
import type { ILogger } from '@/server/application/services/logger.interface';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import { ProcessingExecution } from '@/server/domain/entities/processing-execution.entity';
import { TriggerType } from 'shared/domain/value-objects/trigger-type.value-object';
import { BatchId } from 'shared/domain/value-objects/batch-id.value-object';
import type { Provider } from 'shared/domain/value-objects/provider.value-object';
import { MediaListNotFoundError } from 'shared/domain/errors/media-list.errors';
import {
  JellyseerrNotConfiguredError,
  ProviderNotConfiguredError,
} from 'shared/domain/errors/processing.errors';
import type { IMediaFetcher } from '@/server/application/services/media-fetcher.service.interface';

/**
 * ProcessListUseCase
 *
 * Orchestrates the processing of a single media list:
 * 1. Load list and validate configs
 * 2. Create execution record (status: running)
 * 3. Fetch items from provider
 * 4. Filter cached items
 * 5. Request to Jellyseerr
 * 6. Cache successful requests
 * 7. Update execution record (status: success/error)
 */
export class ProcessListUseCase implements IUseCase<ProcessListCommand, ProcessListResponse> {
  constructor(
    private readonly mediaListRepository: IMediaListRepository,
    private readonly jellyseerrConfigRepository: IJellyseerrConfigRepository,
    private readonly executionHistoryRepository: IExecutionHistoryRepository,
    private readonly cacheRepository: ICacheRepository,
    private readonly mediaFetcherFactory: IMediaFetcherFactory,
    private readonly jellyseerrClient: IJellyseerrClient,
    private readonly logger: ILogger
  ) {}

  async execute(command: ProcessListCommand): Promise<ProcessListResponse> {
    this.logger.info(
      { listId: command.listId, triggerType: command.triggerType },
      'Starting list processing'
    );

    // 1. Load list (with userId check for multitenancy)
    const list = await this.mediaListRepository.findById(command.listId, command.userId);
    if (!list) {
      throw new MediaListNotFoundError(command.listId);
    }

    // 2. Create execution entity (status: running)
    const execution = ProcessingExecution.create({
      listId: command.listId,
      batchId: BatchId.generate(TriggerType.create(command.triggerType)),
      triggerType: TriggerType.create(command.triggerType),
    });
    const savedExecution = await this.executionHistoryRepository.save(execution);

    try {
      // 3. Load configs
      const jellyseerrConfig = await this.loadJellyseerrConfig(command.userId);

      // 4. Fetch items using factory pattern
      const fetcher = await this.createFetcherFor(list.provider, command.userId);
      this.logger.debug(
        { provider: list.provider.getValue(), url: list.url.getValue() },
        'Fetching items from provider'
      );
      const items = await fetcher.fetchItems(list.url.getValue(), list.maxItems);
      this.logger.info({ itemCount: items.length }, 'Items fetched from provider');

      // 5. Filter cached items
      const newItems = await this.cacheRepository.filterAlreadyCached(items);
      this.logger.info(
        {
          totalItems: items.length,
          newItems: newItems.length,
          cached: items.length - newItems.length,
        },
        'Filtered cached items'
      );

      // 6. Request to Jellyseerr
      this.logger.debug({ itemCount: newItems.length }, 'Requesting items to Jellyseerr');
      const results = await this.jellyseerrClient.requestItems(newItems, jellyseerrConfig);
      this.logger.info(
        { successful: results.successful.length, failed: results.failed.length },
        'Jellyseerr requests completed'
      );

      // 7. Cache successful requests
      if (results.successful.length > 0) {
        await this.cacheRepository.cacheItems(list.id, results.successful);
        this.logger.debug({ count: results.successful.length }, 'Cached successful requests');
      }

      // 8. Mark execution as success
      savedExecution.markAsSuccess(items.length, results.successful.length, results.failed.length);
      await this.executionHistoryRepository.save(savedExecution);

      this.logger.info(
        { executionId: savedExecution.id },
        'List processing completed successfully'
      );

      // 9. Return response
      return { execution: ProcessingExecutionMapper.toDTO(savedExecution) };
    } catch (error) {
      // Error handling: mark execution as failed
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        { error: errorMessage, executionId: savedExecution.id },
        'List processing failed'
      );

      savedExecution.markAsError(errorMessage);
      await this.executionHistoryRepository.save(savedExecution);

      throw error;
    }
  }

  /**
   * Load Jellyseerr configuration for user
   */
  private async loadJellyseerrConfig(userId: number) {
    const config = await this.jellyseerrConfigRepository.findByUserId(userId);
    if (!config) {
      throw new JellyseerrNotConfiguredError();
    }
    return config;
  }

  /**
   * Create media fetcher for provider using factory
   */
  private async createFetcherFor(provider: Provider, userId: number): Promise<IMediaFetcher> {
    const fetcher = await this.mediaFetcherFactory.createFetcher(provider, userId);
    if (!fetcher) {
      throw new ProviderNotConfiguredError(provider.getValue());
    }
    return fetcher;
  }
}
