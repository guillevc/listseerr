import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '@/server/infrastructure/db/schema';
import { env } from '@/server/env';

// Infrastructure layer
import { DrizzleGeneralSettingsRepository } from '@/server/infrastructure/repositories/drizzle-general-settings.repository';
import { LoggingUseCaseDecorator } from '@/server/infrastructure/services/core/logging-usecase.decorator';
import { schedulerService } from '@/server/infrastructure/services/core/scheduler.adapter';
import { LoggerService } from '@/server/infrastructure/services/core/logger.adapter';

// Application layer - Use cases
import { GetGeneralSettingsUseCase } from '@/server/application/use-cases/settings/get-general-settings.usecase';
import { UpdateGeneralSettingsUseCase } from '@/server/application/use-cases/settings/update-general-settings.usecase';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type {
  GetGeneralSettingsCommand,
  UpdateGeneralSettingsCommand,
} from 'shared/application/dtos';
import type {
  GetGeneralSettingsResponse,
  UpdateGeneralSettingsResponse,
} from 'shared/application/dtos';

/**
 * Dependency Injection Container for General Settings Domain
 *
 * Wires together all layers following Clean Architecture:
 * - Infrastructure: Concrete implementations (repositories, services)
 * - Application: Use cases with injected dependencies
 * - Presentation: tRPC routers that consume use cases
 *
 * This container implements the Dependency Inversion Principle:
 * Use cases depend on interfaces, this container provides concrete implementations.
 */
export class GeneralSettingsContainer {
  // Infrastructure - Repositories (public for cross-container injection)
  public readonly generalSettingsRepository: DrizzleGeneralSettingsRepository;
  private readonly logger: LoggerService;

  // Configuration values (from env, exposed for routers)
  public readonly timezone: string;

  // Application - Use Cases (public for consumption by routers)
  public readonly getGeneralSettingsUseCase: IUseCase<
    GetGeneralSettingsCommand,
    GetGeneralSettingsResponse
  >;
  public readonly updateGeneralSettingsUseCase: IUseCase<
    UpdateGeneralSettingsCommand,
    UpdateGeneralSettingsResponse
  >;

  constructor(db: BunSQLiteDatabase<typeof schema>) {
    // 1. Instantiate infrastructure layer (adapters)
    this.generalSettingsRepository = new DrizzleGeneralSettingsRepository(db);
    this.logger = new LoggerService('general-settings');
    this.timezone = env.TZ;

    // 2. Instantiate use cases wrapped with logging decorator
    this.getGeneralSettingsUseCase = new LoggingUseCaseDecorator(
      new GetGeneralSettingsUseCase(this.generalSettingsRepository),
      this.logger,
      'GetGeneralSettingsUseCase'
    );
    this.updateGeneralSettingsUseCase = new LoggingUseCaseDecorator(
      new UpdateGeneralSettingsUseCase(
        this.generalSettingsRepository,
        schedulerService,
        this.logger
      ),
      this.logger,
      'UpdateGeneralSettingsUseCase'
    );
  }
}
