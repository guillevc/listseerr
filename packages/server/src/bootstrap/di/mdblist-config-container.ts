import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '@/server/infrastructure/db/schema';
import { DrizzleMdbListConfigRepository } from '@/server/infrastructure/repositories/drizzle-mdblist-config.repository';
import { AesEncryptionService } from '@/server/infrastructure/services/core/aes-encryption.adapter';
import { LoggingUseCaseDecorator } from '@/server/infrastructure/services/core/logging-usecase.decorator';
import { LoggerService } from '@/server/infrastructure/services/core/logger.adapter';
import { GetMdbListConfigUseCase } from '@/server/application/use-cases/mdblist-config/get-mdblist-config.usecase';
import { SaveMdbListConfigUseCase } from '@/server/application/use-cases/mdblist-config/save-mdblist-config.usecase';
import { DeleteMdbListConfigUseCase } from '@/server/application/use-cases/mdblist-config/delete-mdblist-config.usecase';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type {
  GetMdbListConfigCommand,
  SaveMdbListConfigCommand,
  DeleteMdbListConfigCommand,
} from 'shared/application/dtos';
import type {
  GetMdbListConfigResponse,
  MdbListConfigResponse,
  DeleteMdbListConfigResponse,
} from 'shared/application/dtos';
import { env } from '@/server/env';

export class MdbListConfigContainer {
  private readonly mdbListConfigRepository: DrizzleMdbListConfigRepository;
  private readonly logger: LoggerService;

  public readonly getMdbListConfigUseCase: IUseCase<
    GetMdbListConfigCommand,
    GetMdbListConfigResponse
  >;
  public readonly saveMdbListConfigUseCase: IUseCase<
    SaveMdbListConfigCommand,
    MdbListConfigResponse
  >;
  public readonly deleteMdbListConfigUseCase: IUseCase<
    DeleteMdbListConfigCommand,
    DeleteMdbListConfigResponse
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

    this.mdbListConfigRepository = new DrizzleMdbListConfigRepository(db, encryptionService);
    this.logger = new LoggerService('mdblist-config');

    this.getMdbListConfigUseCase = new LoggingUseCaseDecorator(
      new GetMdbListConfigUseCase(this.mdbListConfigRepository),
      this.logger,
      'GetMdbListConfigUseCase'
    );

    this.saveMdbListConfigUseCase = new LoggingUseCaseDecorator(
      new SaveMdbListConfigUseCase(this.mdbListConfigRepository, this.logger),
      this.logger,
      'SaveMdbListConfigUseCase'
    );

    this.deleteMdbListConfigUseCase = new LoggingUseCaseDecorator(
      new DeleteMdbListConfigUseCase(this.mdbListConfigRepository, this.logger),
      this.logger,
      'DeleteMdbListConfigUseCase'
    );
  }
}
