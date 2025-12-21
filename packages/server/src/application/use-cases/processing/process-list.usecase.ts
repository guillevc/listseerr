import type { IMediaListRepository } from '@/server/application/repositories/media-list.repository.interface';
import type { IJellyseerrConfigRepository } from '@/server/application/repositories/jellyseerr-config.repository.interface';
import type { IExecutionHistoryRepository } from '@/server/application/repositories/execution-history.repository.interface';
import type { IMediaFetcherFactory } from '@/server/application/services/media-fetcher-factory.service.interface';
import type { IListProcessingService } from '@/server/application/services/list-processing.service.interface';
import { ProcessingExecutionMapper } from '@/server/application/mappers/processing-execution.mapper';
import type { ProcessListCommand } from 'shared/application/dtos';
import type { ProcessListResponse } from 'shared/application/dtos';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import { ProcessingExecution } from '@/server/domain/entities/processing-execution.entity';
import { TriggerTypeVO } from '@/server/domain/value-objects/trigger-type.vo';
import { BatchIdVO } from '@/server/domain/value-objects/batch-id.vo';
import type { ProviderVO } from '@/server/domain/value-objects/provider.vo';
import { MediaListNotFoundError } from 'shared/domain/errors';
import { JellyseerrNotConfiguredError, ProviderNotConfiguredError } from 'shared/domain/errors';
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
    private readonly listProcessingService: IListProcessingService,
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

      // 5. Process items: check availability and request to Jellyseerr
      const result = await this.listProcessingService.processItems(items, jellyseerrConfig);

      // 6. Mark execution as success
      savedExecution.markAsSuccess(
        items.length,
        result.successful.length,
        result.failed.length,
        result.available.length,
        result.previouslyRequested.length
      );
      await this.executionHistoryRepository.save(savedExecution);

      this.logger.info(
        { executionId: savedExecution.id },
        'List processing completed successfully'
      );

      // 7. Return response with skipped counts
      return {
        execution: ProcessingExecutionMapper.toDTO(savedExecution),
        itemsSkippedPreviouslyRequested: result.previouslyRequested.length,
        itemsSkippedAvailable: result.available.length,
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
