import type { IMediaListRepository } from '@/server/application/repositories/media-list.repository.interface';
import type { IJellyseerrConfigRepository } from '@/server/application/repositories/jellyseerr-config.repository.interface';
import type { IExecutionHistoryRepository } from '@/server/application/repositories/execution-history.repository.interface';
import type { ITraktConfigRepository } from '@/server/application/repositories/trakt-config.repository.interface';
import type { IMdbListConfigRepository } from '@/server/application/repositories/mdblist-config.repository.interface';
import type { IMediaFetcherFactory } from '@/server/application/services/media-fetcher-factory.service.interface';
import type { IJellyseerrClient } from '@/server/application/services/jellyseerr-client.service.interface';
import type { IMediaAvailabilityChecker } from '@/server/application/services/media-availability-checker.service.interface';
import { ProcessingExecutionMapper } from '@/server/application/mappers/processing-execution.mapper';
import type { ProcessBatchCommand } from 'shared/application/dtos/processing/commands.dto';
import type { ProcessBatchResponse } from 'shared/application/dtos/processing/responses.dto';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type { MediaList } from '@/server/domain/entities/media-list.entity';
import { ProcessingExecution } from '@/server/domain/entities/processing-execution.entity';
import { TriggerTypeVO } from 'shared/domain/value-objects/trigger-type.vo';
import { BatchIdVO } from 'shared/domain/value-objects/batch-id.vo';
import { MediaItemVO } from 'shared/domain/value-objects/media-item.vo';
import type { ProviderVO } from 'shared/domain/value-objects/provider.vo';
import type { IMediaFetcher } from '@/server/application/services/media-fetcher.service.interface';
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
 * 4. Check availability in Jellyseerr and categorize items
 * 5. Request only TO_BE_REQUESTED items to Jellyseerr
 * 6. Update all execution records
 */
export class ProcessBatchUseCase implements IUseCase<ProcessBatchCommand, ProcessBatchResponse> {
  constructor(
    private readonly mediaListRepository: IMediaListRepository,
    private readonly jellyseerrConfigRepository: IJellyseerrConfigRepository,
    private readonly executionHistoryRepository: IExecutionHistoryRepository,
    private readonly traktConfigRepository: ITraktConfigRepository,
    private readonly mdbListConfigRepository: IMdbListConfigRepository,
    private readonly mediaFetcherFactory: IMediaFetcherFactory,
    private readonly jellyseerrClient: IJellyseerrClient,
    private readonly availabilityChecker: IMediaAvailabilityChecker,
    private readonly logger: ILogger
  ) {}

  async execute(command: ProcessBatchCommand): Promise<ProcessBatchResponse> {
    this.logger.info({ triggerType: command.triggerType }, 'Starting batch processing');

    // 1. Load lists (filter disabled only for scheduled processing)
    const allLists = await this.mediaListRepository.findAll(command.userId);
    const candidateLists =
      command.triggerType === 'scheduled' ? allLists.filter((list) => list.enabled) : allLists;

    // 2. Pre-check provider configurations (query once, not per-list)
    const [traktConfig, mdbListConfig] = await Promise.all([
      this.traktConfigRepository.findByUserId(command.userId),
      this.mdbListConfigRepository.findByUserId(command.userId),
    ]);

    // 3. Filter out unconfigured providers (silently skip, no error records)
    const listsToProcess = candidateLists.filter((list) => {
      const provider = list.provider;
      if (provider.isStevenLu()) return true; // No config needed
      if (provider.isTrakt() || provider.isTraktChart()) return !!traktConfig;
      if (provider.isMdbList()) return !!mdbListConfig;
      return false;
    });

    this.logger.info(
      {
        totalLists: allLists.length,
        candidateLists: candidateLists.length,
        listsToProcess: listsToProcess.length,
      },
      'Loaded media lists'
    );

    if (listsToProcess.length === 0) {
      this.logger.info('No lists to process, skipping batch processing');
      return {
        success: true,
        processedLists: 0,
        totalItemsFound: 0,
        itemsRequested: 0,
        itemsFailed: 0,
        itemsSkippedPreviouslyRequested: 0,
        itemsSkippedAvailable: 0,
        executions: [],
      };
    }

    // 2. Fetch items from all lists (with rate limiting)
    const triggerType = TriggerTypeVO.create(command.triggerType);
    const batchId = BatchIdVO.generate(triggerType);
    const listsWithItems = await this.fetchFromAllLists(
      listsToProcess,
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

    // 4. Load Jellyseerr config and check availability
    const jellyseerrConfig = await this.loadJellyseerrConfig(command.userId);
    const categorized = await this.availabilityChecker.checkAndCategorize(
      uniqueItems,
      jellyseerrConfig
    );

    this.logger.info(
      {
        uniqueItems: uniqueItems.length,
        toBeRequested: categorized.toBeRequested.length,
        previouslyRequested: categorized.previouslyRequested.length,
        available: categorized.available.length,
      },
      'Media availability check completed'
    );

    // 5. Request only TO_BE_REQUESTED items to Jellyseerr
    const results = await this.jellyseerrClient.requestItems(
      categorized.toBeRequested,
      jellyseerrConfig
    );
    this.logger.info(
      { successful: results.successful.length, failed: results.failed.length },
      'Jellyseerr batch requests completed'
    );

    // 6. Update all execution histories
    const executions = await this.updateAllExecutions(listsWithItems, results, categorized);

    this.logger.info(
      { processedLists: listsToProcess.length },
      'Batch processing completed successfully'
    );

    // 7. Return aggregate response
    return {
      success: true,
      processedLists: listsToProcess.length,
      totalItemsFound,
      itemsRequested: results.successful.length,
      itemsFailed: results.failed.length,
      itemsSkippedPreviouslyRequested: categorized.previouslyRequested.length,
      itemsSkippedAvailable: categorized.available.length,
      executions: executions.map((e) => ProcessingExecutionMapper.toDTO(e)),
    };
  }

  /**
   * Fetch items from all lists and create execution records
   */
  private async fetchFromAllLists(
    lists: MediaList[],
    userId: number,
    batchId: BatchIdVO,
    triggerType: TriggerTypeVO
  ): Promise<Array<{ list: MediaList; items: MediaItemVO[]; execution: ProcessingExecution }>> {
    const results: Array<{
      list: MediaList;
      items: MediaItemVO[];
      execution: ProcessingExecution;
    }> = [];

    for (const list of lists) {
      // Create execution record (status: running)
      const execution = ProcessingExecution.create({
        listId: list.id,
        batchId,
        triggerType,
      });
      const savedExecution = await this.executionHistoryRepository.save(execution);

      try {
        // Create fetcher using factory
        const fetcher = await this.createFetcherFor(list.provider, userId);

        this.logger.debug(
          { listId: list.id, provider: list.provider.getValue(), url: list.url.getValue() },
          'Fetching items from provider'
        );
        const items = await fetcher.fetchItems(list.url.getValue(), list.maxItems);

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
    listsWithItems: Array<{ list: MediaList; items: MediaItemVO[]; execution: ProcessingExecution }>
  ): Map<number, MediaItemVO> {
    const itemsMap = new Map<number, MediaItemVO>();

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
    listsWithItems: Array<{
      list: MediaList;
      items: MediaItemVO[];
      execution: ProcessingExecution;
    }>,
    results: { successful: MediaItemVO[]; failed: Array<{ item: MediaItemVO; error: string }> },
    categorized: {
      toBeRequested: MediaItemVO[];
      previouslyRequested: MediaItemVO[];
      available: MediaItemVO[];
    }
  ): Promise<ProcessingExecution[]> {
    const updatedExecutions: ProcessingExecution[] = [];

    // Build sets for quick lookup
    const previouslyRequestedTmdbIds = new Set(
      categorized.previouslyRequested.map((i) => i.tmdbId)
    );
    const availableTmdbIds = new Set(categorized.available.map((i) => i.tmdbId));

    for (const { items, execution } of listsWithItems) {
      // Skip already-failed executions
      if (execution.status.isError()) {
        updatedExecutions.push(execution);
        continue;
      }

      // Calculate counts for this list's items
      const listTmdbIds = new Set(items.map((i) => i.tmdbId));
      const successfulCount = results.successful.filter((i) => listTmdbIds.has(i.tmdbId)).length;
      const failedCount = results.failed.filter((f) => listTmdbIds.has(f.item.tmdbId)).length;
      const skippedAvailableCount = items.filter((i) => availableTmdbIds.has(i.tmdbId)).length;
      const skippedPreviouslyRequestedCount = items.filter((i) =>
        previouslyRequestedTmdbIds.has(i.tmdbId)
      ).length;

      // Mark execution as success
      execution.markAsSuccess(
        items.length,
        successfulCount,
        failedCount,
        skippedAvailableCount,
        skippedPreviouslyRequestedCount
      );
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
   * Create media fetcher for provider using factory
   */
  private async createFetcherFor(provider: ProviderVO, userId: number): Promise<IMediaFetcher> {
    const fetcher = await this.mediaFetcherFactory.createFetcher(provider, userId);
    if (!fetcher) {
      throw new ProviderNotConfiguredError(provider.getValue());
    }
    return fetcher;
  }
}
