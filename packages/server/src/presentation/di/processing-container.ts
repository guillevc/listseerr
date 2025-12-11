import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '../../db/schema';

// Infrastructure
import { DrizzleExecutionHistoryRepository } from '../../infrastructure/repositories/drizzle-execution-history.repository';
import { DrizzleCacheRepository } from '../../infrastructure/repositories/drizzle-cache.repository';
import { DrizzleMediaListRepository } from '../../infrastructure/repositories/drizzle-media-list.repository';
import { DrizzleProviderConfigRepository } from '../../infrastructure/repositories/drizzle-provider-config.repository';
import { DrizzleJellyseerrConfigRepository } from '../../infrastructure/repositories/drizzle-jellyseerr-config.repository';
import { TraktMediaFetcher } from '../../infrastructure/services/trakt-media-fetcher.adapter';
import { MdbListMediaFetcher } from '../../infrastructure/services/mdblist-media-fetcher.adapter';
import { StevenLuMediaFetcher } from '../../infrastructure/services/stevenlu-media-fetcher.adapter';
import { JellyseerrHttpClient } from '../../infrastructure/services/jellyseerr-http-client.adapter';
import { AesEncryptionService } from '../../infrastructure/services/aes-encryption.service';

// Use Cases
import { ProcessListUseCase } from '../../application/use-cases/process-list.usecase';
import { ProcessBatchUseCase } from '../../application/use-cases/process-batch.usecase';
import { GetExecutionHistoryUseCase } from '../../application/use-cases/get-execution-history.usecase';

// Application interfaces
import type { IMediaFetcher } from '../../application/services/media-fetcher.service.interface';

// Logger
import { createLogger } from '../../lib/logger';
import { env } from '../../env';

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

  // Application (public)
  public readonly processListUseCase: ProcessListUseCase;
  public readonly processBatchUseCase: ProcessBatchUseCase;
  public readonly getExecutionHistoryUseCase: GetExecutionHistoryUseCase;

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

    const logger = createLogger('processing');

    // 3. Instantiate use cases with dependencies injected
    this.processListUseCase = new ProcessListUseCase(
      this.mediaListRepository,
      this.providerConfigRepository,
      this.jellyseerrConfigRepository,
      this.executionHistoryRepository,
      this.cacheRepository,
      this.mediaFetchers,
      this.jellyseerrClient,
      logger
    );

    this.processBatchUseCase = new ProcessBatchUseCase(
      this.mediaListRepository,
      this.providerConfigRepository,
      this.jellyseerrConfigRepository,
      this.executionHistoryRepository,
      this.cacheRepository,
      this.mediaFetchers,
      this.jellyseerrClient,
      logger
    );

    this.getExecutionHistoryUseCase = new GetExecutionHistoryUseCase(
      this.executionHistoryRepository
    );
  }
}
