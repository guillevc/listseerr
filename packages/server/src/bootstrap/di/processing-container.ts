import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '@/server/infrastructure/db/schema';

// Infrastructure
import { DrizzleExecutionHistoryRepository } from '@/server/infrastructure/repositories/drizzle-execution-history.repository';
import { DrizzleCacheRepository } from '@/server/infrastructure/repositories/drizzle-cache.repository';
import { DrizzleMediaListRepository } from '@/server/infrastructure/repositories/drizzle-media-list.repository';
import { DrizzleProviderConfigRepository } from '@/server/infrastructure/repositories/drizzle-provider-config.repository';
import { DrizzleJellyseerrConfigRepository } from '@/server/infrastructure/repositories/drizzle-jellyseerr-config.repository';
import { TraktMediaFetcher } from '@/server/infrastructure/services/adapters/trakt-media-fetcher.adapter';
import { MdbListMediaFetcher } from '@/server/infrastructure/services/adapters/mdblist-media-fetcher.adapter';
import { StevenLuMediaFetcher } from '@/server/infrastructure/services/adapters/stevenlu-media-fetcher.adapter';
import { JellyseerrHttpClient } from '@/server/infrastructure/services/adapters/jellyseerr-http-client.adapter';
import { AesEncryptionService } from '@/server/infrastructure/services/core/aes-encryption.service';

// Use Cases
import { ProcessListUseCase } from '@/server/application/use-cases/processing/process-list.usecase';
import { ProcessBatchUseCase } from '@/server/application/use-cases/processing/process-batch.usecase';
import { GetExecutionHistoryUseCase } from '@/server/application/use-cases/processing/get-execution-history.usecase';

// Application interfaces
import type { IMediaFetcher } from '@/server/application/services/media-fetcher.service.interface';
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
import { LoggerService } from '@/server/infrastructure/services/core/logger.service';
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
  private readonly cacheRepository: DrizzleCacheRepository;
  private readonly mediaListRepository: DrizzleMediaListRepository;
  private readonly providerConfigRepository: DrizzleProviderConfigRepository;
  private readonly jellyseerrConfigRepository: DrizzleJellyseerrConfigRepository;
  private readonly mediaFetchers: IMediaFetcher[];
  private readonly jellyseerrClient: JellyseerrHttpClient;
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
    this.cacheRepository = new DrizzleCacheRepository(db);
    this.mediaListRepository = new DrizzleMediaListRepository(db);
    this.providerConfigRepository = new DrizzleProviderConfigRepository(db, encryptionService);
    this.jellyseerrConfigRepository = new DrizzleJellyseerrConfigRepository(db);

    // Media fetchers (strategy pattern)
    this.mediaFetchers = [
      new TraktMediaFetcher(),
      new MdbListMediaFetcher(),
      new StevenLuMediaFetcher(),
    ];

    this.jellyseerrClient = new JellyseerrHttpClient();

    this.logger = new LoggerService('processing');

    // 3. Instantiate use cases with dependencies injected
    this.processListUseCase = new ProcessListUseCase(
      this.mediaListRepository,
      this.providerConfigRepository,
      this.jellyseerrConfigRepository,
      this.executionHistoryRepository,
      this.cacheRepository,
      this.mediaFetchers,
      this.jellyseerrClient,
      this.logger
    );

    this.processBatchUseCase = new ProcessBatchUseCase(
      this.mediaListRepository,
      this.providerConfigRepository,
      this.jellyseerrConfigRepository,
      this.executionHistoryRepository,
      this.cacheRepository,
      this.mediaFetchers,
      this.jellyseerrClient,
      this.logger
    );

    this.getExecutionHistoryUseCase = new GetExecutionHistoryUseCase(
      this.executionHistoryRepository
    );
  }
}
