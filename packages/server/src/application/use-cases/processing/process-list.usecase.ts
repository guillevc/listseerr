import type { IMediaListRepository } from '@/server/application/repositories/media-list.repository.interface';
import type { IJellyseerrConfigRepository } from '@/server/application/repositories/jellyseerr-config.repository.interface';
import type { IExecutionHistoryRepository } from '@/server/application/repositories/execution-history.repository.interface';
import type { IMediaFetcherFactory } from '@/server/application/services/media-fetcher-factory.service.interface';
import type { IJellyseerrClient } from '@/server/application/services/jellyseerr-client.service.interface';
import type { IMediaAvailabilityChecker } from '@/server/application/services/media-availability-checker.service.interface';
import { ProcessingExecutionMapper } from '@/server/application/mappers/processing-execution.mapper';
import type { ProcessListCommand } from 'shared/application/dtos/processing/commands.dto';
import type { ProcessListResponse } from 'shared/application/dtos/processing/responses.dto';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import { ProcessingExecution } from '@/server/domain/entities/processing-execution.entity';
import { TriggerTypeVO } from '@/server/domain/value-objects/trigger-type.vo';
import { BatchIdVO } from '@/server/domain/value-objects/batch-id.vo';
import type { ProviderVO } from '@/server/domain/value-objects/provider.vo';
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
 * 4. Check availability in Jellyseerr and categorize items
 * 5. Request only TO_BE_REQUESTED items to Jellyseerr
 * 6. Update execution record (status: success/error)
 */
export class ProcessListUseCase implements IUseCase<ProcessListCommand, ProcessListResponse> {
  constructor(
    private readonly mediaListRepository: IMediaListRepository,
    private readonly jellyseerrConfigRepository: IJellyseerrConfigRepository,
    private readonly executionHistoryRepository: IExecutionHistoryRepository,
    private readonly mediaFetcherFactory: IMediaFetcherFactory,
    private readonly jellyseerrClient: IJellyseerrClient,
    private readonly availabilityChecker: IMediaAvailabilityChecker,
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

    // 2. Validate provider is configured BEFORE creating execution record
    // This ensures unconfigured lists don't create error records
    const fetcher = await this.createFetcherFor(list.provider, command.userId);

    // 3. Create execution entity (status: running) - only after validation passes
    const execution = ProcessingExecution.create({
      listId: command.listId,
      batchId: BatchIdVO.generate(TriggerTypeVO.create(command.triggerType)),
      triggerType: TriggerTypeVO.create(command.triggerType),
    });
    const savedExecution = await this.executionHistoryRepository.save(execution);

    try {
      // 4. Load configs
      const jellyseerrConfig = await this.loadJellyseerrConfig(command.userId);
      this.logger.debug(
        { provider: list.provider.getValue(), url: list.url.getValue() },
        'Fetching items from provider'
      );
      const items = await fetcher.fetchItems(list.url.getValue(), list.maxItems);
      this.logger.info({ itemCount: items.length }, 'Items fetched from provider');

      // 5. Check availability in Jellyseerr and categorize items
      const categorized = await this.availabilityChecker.checkAndCategorize(
        items,
        jellyseerrConfig
      );
      this.logger.info(
        {
          totalItems: items.length,
          toBeRequested: categorized.toBeRequested.length,
          previouslyRequested: categorized.previouslyRequested.length,
          available: categorized.available.length,
        },
        'Media availability check completed'
      );

      // 6. Request only TO_BE_REQUESTED items to Jellyseerr
      const results = await this.jellyseerrClient.requestItems(
        categorized.toBeRequested,
        jellyseerrConfig
      );
      this.logger.info(
        { successful: results.successful.length, failed: results.failed.length },
        'Jellyseerr requests completed'
      );

      // 7. Mark execution as success
      savedExecution.markAsSuccess(
        items.length,
        results.successful.length,
        results.failed.length,
        categorized.available.length,
        categorized.previouslyRequested.length
      );
      await this.executionHistoryRepository.save(savedExecution);

      this.logger.info(
        { executionId: savedExecution.id },
        'List processing completed successfully'
      );

      // 8. Return response with skipped counts
      return {
        execution: ProcessingExecutionMapper.toDTO(savedExecution),
        itemsSkippedPreviouslyRequested: categorized.previouslyRequested.length,
        itemsSkippedAvailable: categorized.available.length,
      };
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
  private async createFetcherFor(provider: ProviderVO, userId: number): Promise<IMediaFetcher> {
    const fetcher = await this.mediaFetcherFactory.createFetcher(provider, userId);
    if (!fetcher) {
      throw new ProviderNotConfiguredError(provider.getValue());
    }
    return fetcher;
  }
}
