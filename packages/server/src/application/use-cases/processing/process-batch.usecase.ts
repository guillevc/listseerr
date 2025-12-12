import type { IMediaListRepository } from '../../repositories/media-list.repository.interface';
import type { IProviderConfigRepository } from '../../repositories/provider-config.repository.interface';
import type { IJellyseerrConfigRepository } from '../../repositories/jellyseerr-config.repository.interface';
import type { IExecutionHistoryRepository } from '../../repositories/execution-history.repository.interface';
import type { ICacheRepository } from '../../repositories/cache.repository.interface';
import type { IMediaFetcher } from '../../services/media-fetcher.service.interface';
import type { IJellyseerrClient } from '../../services/jellyseerr-client.service.interface';
import type { ProcessBatchCommand } from 'shared/application/dtos/processing/commands.dto';
import type { ProcessBatchResponse } from 'shared/application/dtos/processing/responses.dto';
import type { ILogger } from '../../services/logger.interface';
import type { IUseCase } from '../use-case.interface';
import { LogExecution } from '../../../infrastructure/services/core/decorators/log-execution.decorator';
import type { MediaList } from '../../../domain/entities/media-list.entity';
import { ProcessingExecution } from '../../../domain/entities/processing-execution.entity';
import { TriggerType } from 'shared/domain/value-objects/trigger-type.value-object';
import { BatchId } from 'shared/domain/value-objects/batch-id.value-object';
import { MediaItem } from 'shared/domain/value-objects/media-item.value-object';
import { Provider } from 'shared/domain/value-objects/provider.value-object';
import {
  JellyseerrNotConfiguredError,
  ProviderNotConfiguredError,
} from 'shared/domain/errors/processing.errors';

/**
 * ProcessBatchUseCase
 *
 * Orchestrates batch processing of all enabled media lists with global deduplication:
 * 1. Load all enabled lists
 * 2. Fetch items from all lists (with executions created)
 * 3. Global deduplication by TMDB ID
 * 4. Filter cached items
 * 5. Batch request to Jellyseerr
 * 6. Cache successful requests
 * 7. Update all execution records
 */
export class ProcessBatchUseCase implements IUseCase<ProcessBatchCommand, ProcessBatchResponse> {
  constructor(
    private readonly mediaListRepository: IMediaListRepository,
    private readonly providerConfigRepository: IProviderConfigRepository,
    private readonly jellyseerrConfigRepository: IJellyseerrConfigRepository,
    private readonly executionHistoryRepository: IExecutionHistoryRepository,
    private readonly cacheRepository: ICacheRepository,
    private readonly mediaFetchers: IMediaFetcher[],
    private readonly jellyseerrClient: IJellyseerrClient,
    private readonly logger: ILogger
  ) {}

  @LogExecution('processing:batch')
  async execute(command: ProcessBatchCommand): Promise<ProcessBatchResponse> {
    this.logger.info({ triggerType: command.triggerType }, 'Starting batch processing');

    // 1. Load all enabled lists
    const allLists = await this.mediaListRepository.findAll(command.userId);
    const enabledLists = allLists.filter((list) => list.enabled);

    this.logger.info(
      { totalLists: allLists.length, enabledLists: enabledLists.length },
      'Loaded media lists'
    );

    if (enabledLists.length === 0) {
      this.logger.info('No enabled lists found, skipping batch processing');
      return {
        success: true,
        processedLists: 0,
        totalItemsFound: 0,
        itemsRequested: 0,
        itemsFailed: 0,
        executions: [],
      };
    }

    // 2. Fetch items from all lists (with rate limiting)
    const triggerType = TriggerType.create(command.triggerType);
    const batchId = BatchId.generate(triggerType);
    const listsWithItems = await this.fetchFromAllLists(
      enabledLists,
      command.userId,
      batchId,
      triggerType
    );

    // 3. Global deduplication (aggregate all TMDB IDs)
    const globalItemsMap = this.deduplicateGlobally(listsWithItems);
    const uniqueItems = Array.from(globalItemsMap.values());
    const totalItemsFound = listsWithItems.reduce((sum, lwi) => sum + lwi.items.length, 0);

    this.logger.info(
      { totalItems: totalItemsFound, uniqueItems: uniqueItems.length },
      'Global deduplication completed'
    );

    // 4. Filter already cached items
    const newItems = await this.cacheRepository.filterAlreadyCached(uniqueItems);
    this.logger.info(
      {
        uniqueItems: uniqueItems.length,
        newItems: newItems.length,
        cached: uniqueItems.length - newItems.length,
      },
      'Filtered cached items'
    );

    // 5. Load Jellyseerr config and batch request
    const jellyseerrConfig = await this.loadJellyseerrConfig(command.userId);
    this.logger.debug({ itemCount: newItems.length }, 'Requesting items to Jellyseerr');
    const results = await this.jellyseerrClient.requestItems(newItems, jellyseerrConfig);
    this.logger.info(
      { successful: results.successful.length, failed: results.failed.length },
      'Jellyseerr batch requests completed'
    );

    // 6. Cache successful requests (using first list as reference)
    if (results.successful.length > 0 && enabledLists.length > 0) {
      await this.cacheRepository.cacheItems(enabledLists[0].id, results.successful);
      this.logger.debug({ count: results.successful.length }, 'Cached successful requests');
    }

    // 7. Update all execution histories
    const executions = await this.updateAllExecutions(listsWithItems, results);

    this.logger.info(
      { processedLists: enabledLists.length },
      'Batch processing completed successfully'
    );

    // 8. Return aggregate response
    return {
      success: true,
      processedLists: enabledLists.length,
      totalItemsFound,
      itemsRequested: results.successful.length,
      itemsFailed: results.failed.length,
      executions: executions.map((e) => e.toDTO()),
    };
  }

  /**
   * Fetch items from all lists and create execution records
   */
  private async fetchFromAllLists(
    lists: MediaList[],
    userId: number,
    batchId: BatchId,
    triggerType: TriggerType
  ): Promise<Array<{ list: MediaList; items: MediaItem[]; execution: ProcessingExecution }>> {
    const results: Array<{ list: MediaList; items: MediaItem[]; execution: ProcessingExecution }> =
      [];

    for (const list of lists) {
      // Create execution record (status: running)
      const execution = ProcessingExecution.create({
        listId: list.id,
        batchId,
        triggerType,
      });
      const savedExecution = await this.executionHistoryRepository.save(execution);

      try {
        // Load provider config
        const providerConfig = await this.loadProviderConfig(list.provider, userId);

        // Fetch items
        const fetcher = this.findFetcherFor(list.provider);
        this.logger.debug(
          { listId: list.id, provider: list.provider.getValue(), url: list.url.getValue() },
          'Fetching items from provider'
        );
        const items = await fetcher.fetchItems(
          list.url.getValue(),
          list.maxItems,
          providerConfig.config
        );

        this.logger.info(
          { listId: list.id, itemCount: items.length },
          'Items fetched from provider'
        );

        results.push({ list, items, execution: savedExecution });
      } catch (error) {
        // Mark execution as failed for this list
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          { listId: list.id, error: errorMessage },
          'Failed to fetch items from list'
        );

        savedExecution.markAsError(errorMessage);
        await this.executionHistoryRepository.save(savedExecution);

        // Continue processing other lists
        results.push({ list, items: [], execution: savedExecution });
      }
    }

    return results;
  }

  /**
   * Global deduplication: Aggregate all items by TMDB ID
   */
  private deduplicateGlobally(
    listsWithItems: Array<{ list: MediaList; items: MediaItem[]; execution: ProcessingExecution }>
  ): Map<number, MediaItem> {
    const itemsMap = new Map<number, MediaItem>();

    for (const { items } of listsWithItems) {
      for (const item of items) {
        // Only keep first occurrence of each TMDB ID
        if (!itemsMap.has(item.tmdbId)) {
          itemsMap.set(item.tmdbId, item);
        }
      }
    }

    return itemsMap;
  }

  /**
   * Update execution records for all lists
   */
  private async updateAllExecutions(
    listsWithItems: Array<{ list: MediaList; items: MediaItem[]; execution: ProcessingExecution }>,
    results: { successful: MediaItem[]; failed: Array<{ item: MediaItem; error: string }> }
  ): Promise<ProcessingExecution[]> {
    const updatedExecutions: ProcessingExecution[] = [];

    for (const { items, execution } of listsWithItems) {
      // Skip already-failed executions
      if (execution.status.isError()) {
        updatedExecutions.push(execution);
        continue;
      }

      // Calculate successful/failed counts for this list's items
      const listTmdbIds = new Set(items.map((i) => i.tmdbId));
      const successfulCount = results.successful.filter((i) => listTmdbIds.has(i.tmdbId)).length;
      const failedCount = results.failed.filter((f) => listTmdbIds.has(f.item.tmdbId)).length;

      // Mark execution as success
      execution.markAsSuccess(items.length, successfulCount, failedCount);
      const updated = await this.executionHistoryRepository.save(execution);
      updatedExecutions.push(updated);
    }

    return updatedExecutions;
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
   * Load provider configuration for user
   */
  private async loadProviderConfig(provider: Provider, userId: number) {
    const config = await this.providerConfigRepository.findByUserIdAndProvider(userId, provider);
    if (!config) {
      throw new ProviderNotConfiguredError(provider.getValue());
    }
    return config;
  }

  /**
   * Find the appropriate media fetcher for the provider type
   */
  private findFetcherFor(provider: Provider): IMediaFetcher {
    const fetcher = this.mediaFetchers.find((f) => f.supports(provider));
    if (!fetcher) {
      throw new Error(`No fetcher found for provider: ${provider.getValue()}`);
    }
    return fetcher;
  }
}
