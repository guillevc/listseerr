import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '../../infrastructure/db/schema';
import { DrizzleProviderConfigRepository } from '../../infrastructure/repositories/drizzle-provider-config.repository';
import { AesEncryptionService } from '../../infrastructure/services/core/aes-encryption.service';
import { GetProviderConfigUseCase } from '../../application/use-cases/provider-config/get-provider-config.usecase';
import { UpdateProviderConfigUseCase } from '../../application/use-cases/provider-config/update-provider-config.usecase';
import { DeleteProviderConfigUseCase } from '../../application/use-cases/provider-config/delete-provider-config.usecase';
import type { IUseCase } from '../../application/use-cases/use-case.interface';
import type {
  GetProviderConfigCommand,
  UpdateProviderConfigCommand,
  DeleteProviderConfigCommand,
} from 'shared/application/dtos/provider-config/commands.dto';
import type {
  GetProviderConfigResponse,
  UpdateProviderConfigResponse,
  DeleteProviderConfigResponse,
} from 'shared/application/dtos/provider-config/responses.dto';
import { createLogger } from '../../infrastructure/services/core/logger.service';
import { env } from '../../env';

/**
 * ProviderConfig Dependency Injection Container
 *
 * Wires together all layers of the Provider Config feature:
 * - Infrastructure: Repository implementations
 * - Application: Use cases with dependencies injected
 */
export class ProviderConfigContainer {
  // Infrastructure layer (private)
  private readonly providerConfigRepository: DrizzleProviderConfigRepository;

  // Application layer (public)
  public readonly getProviderConfigUseCase: IUseCase<
    GetProviderConfigCommand,
    GetProviderConfigResponse
  >;
  public readonly updateProviderConfigUseCase: IUseCase<
    UpdateProviderConfigCommand,
    UpdateProviderConfigResponse
  >;
  public readonly deleteProviderConfigUseCase: IUseCase<
    DeleteProviderConfigCommand,
    DeleteProviderConfigResponse
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

    // 2. Instantiate infrastructure layer with encryption
    this.providerConfigRepository = new DrizzleProviderConfigRepository(db, encryptionService);

    // 3. Instantiate use cases with dependencies injected
    this.getProviderConfigUseCase = new GetProviderConfigUseCase(this.providerConfigRepository);
    this.updateProviderConfigUseCase = new UpdateProviderConfigUseCase(
      this.providerConfigRepository,
      createLogger('provider-config')
    );
    this.deleteProviderConfigUseCase = new DeleteProviderConfigUseCase(
      this.providerConfigRepository,
      createLogger('provider-config')
    );
  }
}
