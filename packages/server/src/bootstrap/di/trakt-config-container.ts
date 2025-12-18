import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '@/server/infrastructure/db/schema';
import { DrizzleTraktConfigRepository } from '@/server/infrastructure/repositories/drizzle-trakt-config.repository';
import { AesEncryptionService } from '@/server/infrastructure/services/core/aes-encryption.adapter';
import { LoggingUseCaseDecorator } from '@/server/infrastructure/services/core/logging-usecase.decorator';
import { LoggerService } from '@/server/infrastructure/services/core/logger.adapter';
import { GetTraktConfigUseCase } from '@/server/application/use-cases/trakt-config/get-trakt-config.usecase';
import { SaveTraktConfigUseCase } from '@/server/application/use-cases/trakt-config/save-trakt-config.usecase';
import { DeleteTraktConfigUseCase } from '@/server/application/use-cases/trakt-config/delete-trakt-config.usecase';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type {
  GetTraktConfigCommand,
  GetTraktConfigResponse,
  SaveTraktConfigCommand,
  TraktConfigResponse,
  DeleteTraktConfigCommand,
  DeleteTraktConfigResponse,
} from 'shared/application/dtos/trakt-config.commands.dto';
import { env } from '@/server/env';

export class TraktConfigContainer {
  private readonly traktConfigRepository: DrizzleTraktConfigRepository;
  private readonly logger: LoggerService;

  public readonly getTraktConfigUseCase: IUseCase<GetTraktConfigCommand, GetTraktConfigResponse>;
  public readonly saveTraktConfigUseCase: IUseCase<SaveTraktConfigCommand, TraktConfigResponse>;
  public readonly deleteTraktConfigUseCase: IUseCase<
    DeleteTraktConfigCommand,
    DeleteTraktConfigResponse
  >;

  constructor(db: BunSQLiteDatabase<typeof schema>) {
    const encryptionKey = Buffer.from(env.ENCRYPTION_KEY, 'hex');
    if (encryptionKey.length !== 32) {
      throw new Error(
        `ENCRYPTION_KEY must be 32 bytes (64 hex characters). ` +
          `Got ${encryptionKey.length} bytes. ` +
          `Generate a valid key with: openssl rand -hex 32`
      );
    }
    const encryptionService = new AesEncryptionService(encryptionKey);

    this.traktConfigRepository = new DrizzleTraktConfigRepository(db, encryptionService);
    this.logger = new LoggerService('trakt-config');

    this.getTraktConfigUseCase = new LoggingUseCaseDecorator(
      new GetTraktConfigUseCase(this.traktConfigRepository),
      this.logger,
      'GetTraktConfigUseCase'
    );

    this.saveTraktConfigUseCase = new LoggingUseCaseDecorator(
      new SaveTraktConfigUseCase(this.traktConfigRepository, this.logger),
      this.logger,
      'SaveTraktConfigUseCase'
    );

    this.deleteTraktConfigUseCase = new LoggingUseCaseDecorator(
      new DeleteTraktConfigUseCase(this.traktConfigRepository, this.logger),
      this.logger,
      'DeleteTraktConfigUseCase'
    );
  }
}
