import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '@/server/infrastructure/db/schema';

// Infrastructure
import { DrizzleExecutionHistoryRepository } from '@/server/infrastructure/repositories/drizzle-execution-history.repository';
import { DrizzleMediaListRepository } from '@/server/infrastructure/repositories/drizzle-media-list.repository';
import { DrizzleTraktConfigRepository } from '@/server/infrastructure/repositories/drizzle-trakt-config.repository';
import { DrizzleMdbListConfigRepository } from '@/server/infrastructure/repositories/drizzle-mdblist-config.repository';
import { DrizzleJellyseerrConfigRepository } from '@/server/infrastructure/repositories/drizzle-jellyseerr-config.repository';
import { MediaFetcherFactory } from '@/server/infrastructure/services/adapters/media-fetcher-factory.adapter';
import { JellyseerrHttpClient } from '@/server/infrastructure/services/adapters/jellyseerr-http-client.adapter';
import { HttpMediaAvailabilityChecker } from '@/server/infrastructure/services/adapters/http-media-availability-checker.adapter';
import { AesEncryptionService } from '@/server/infrastructure/services/core/aes-encryption.adapter';
import { LoggingUseCaseDecorator } from '@/server/infrastructure/services/core/logging-usecase.decorator';

// Use Cases
import { ProcessListUseCase } from '@/server/application/use-cases/processing/process-list.usecase';
import { ProcessBatchUseCase } from '@/server/application/use-cases/processing/process-batch.usecase';
import { GetExecutionHistoryUseCase } from '@/server/application/use-cases/processing/get-execution-history.usecase';

// Application interfaces
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type {
  ProcessListCommand,
  ProcessBatchCommand,
  GetExecutionHistoryCommand,
} from 'shared/application/dtos/processing/commands.dto';
import type {
  ProcessListResponse,
  ProcessBatchResponse,
  GetExecutionHistoryResponse,
} from 'shared/application/dtos/processing/responses.dto';

// Logger
import { LoggerService } from '@/server/infrastructure/services/core/logger.adapter';
import { env } from '@/server/env';

/**
 * Processing Dependency Injection Container
 *
 * Wires together all layers of the Processing feature:
 * - Infrastructure: Repository implementations, service adapters
 * - Application: Use cases with dependencies injected
 */
export class ProcessingContainer {
  // Infrastructure (private)
  private readonly executionHistoryRepository: DrizzleExecutionHistoryRepository;
  private readonly mediaListRepository: DrizzleMediaListRepository;
  private readonly traktConfigRepository: DrizzleTraktConfigRepository;
  private readonly mdbListConfigRepository: DrizzleMdbListConfigRepository;
  private readonly jellyseerrConfigRepository: DrizzleJellyseerrConfigRepository;
  private readonly mediaFetcherFactory: MediaFetcherFactory;
  private readonly jellyseerrClient: JellyseerrHttpClient;
  private readonly availabilityChecker: HttpMediaAvailabilityChecker;
  private readonly logger: LoggerService;

  // Application (public)
  public readonly processListUseCase: IUseCase<ProcessListCommand, ProcessListResponse>;
  public readonly processBatchUseCase: IUseCase<ProcessBatchCommand, ProcessBatchResponse>;
  public readonly getExecutionHistoryUseCase: IUseCase<
    GetExecutionHistoryCommand,
    GetExecutionHistoryResponse
  >;

  constructor(db: BunSQLiteDatabase<typeof schema>) {
    // 1. Instantiate encryption service with validated key
    const encryptionKey = Buffer.from(env.ENCRYPTION_KEY, 'hex');
    if (encryptionKey.length !== 32) {
      throw new Error(
        `ENCRYPTION_KEY must be 32 bytes (64 hex characters). ` +
          `Got ${encryptionKey.length} bytes. ` +
          `Generate a valid key with: openssl rand -hex 32`
      );
    }
    const encryptionService = new AesEncryptionService(encryptionKey);

    // 2. Instantiate infrastructure layer
    this.executionHistoryRepository = new DrizzleExecutionHistoryRepository(db);
    this.mediaListRepository = new DrizzleMediaListRepository(db);
    this.traktConfigRepository = new DrizzleTraktConfigRepository(db, encryptionService);
    this.mdbListConfigRepository = new DrizzleMdbListConfigRepository(db, encryptionService);
    this.jellyseerrConfigRepository = new DrizzleJellyseerrConfigRepository(db);

    // Media fetcher factory (creates fetchers on-demand with fresh credentials)
    this.mediaFetcherFactory = new MediaFetcherFactory(
      this.traktConfigRepository,
      this.mdbListConfigRepository
    );

    this.jellyseerrClient = new JellyseerrHttpClient();

    this.availabilityChecker = new HttpMediaAvailabilityChecker(
      new LoggerService('availability-checker')
    );

    this.logger = new LoggerService('processing');

    // 3. Instantiate use cases wrapped with logging decorator
    this.processListUseCase = new LoggingUseCaseDecorator(
      new ProcessListUseCase(
        this.mediaListRepository,
        this.jellyseerrConfigRepository,
        this.executionHistoryRepository,
        this.mediaFetcherFactory,
        this.jellyseerrClient,
        this.availabilityChecker,
        this.logger
      ),
      new LoggerService('processing'),
      'ProcessListUseCase'
    );

    this.processBatchUseCase = new LoggingUseCaseDecorator(
      new ProcessBatchUseCase(
        this.mediaListRepository,
        this.jellyseerrConfigRepository,
        this.executionHistoryRepository,
        this.traktConfigRepository,
        this.mdbListConfigRepository,
        this.mediaFetcherFactory,
        this.jellyseerrClient,
        this.availabilityChecker,
        this.logger
      ),
      new LoggerService('processing'),
      'ProcessBatchUseCase'
    );

    this.getExecutionHistoryUseCase = new LoggingUseCaseDecorator(
      new GetExecutionHistoryUseCase(this.executionHistoryRepository),
      new LoggerService('processing'),
      'GetExecutionHistoryUseCase'
    );
  }
}
