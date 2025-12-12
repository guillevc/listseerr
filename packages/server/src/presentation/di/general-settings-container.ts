import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '../../db/schema';

// Infrastructure layer
import { DrizzleGeneralSettingsRepository } from '../../infrastructure/repositories/drizzle-general-settings.repository';

// Application layer - Use cases
import { GetGeneralSettingsUseCase } from '../../application/use-cases/get-general-settings.usecase';
import { UpdateGeneralSettingsUseCase } from '../../application/use-cases/update-general-settings.usecase';

// Infrastructure services (existing)
import { scheduler } from '../../lib/scheduler';
import { createLogger } from '../../lib/logger';

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
  // Infrastructure - Repositories
  private readonly generalSettingsRepository: DrizzleGeneralSettingsRepository;

  // Application - Use Cases (public for consumption by routers)
  public readonly getGeneralSettingsUseCase: GetGeneralSettingsUseCase;
  public readonly updateGeneralSettingsUseCase: UpdateGeneralSettingsUseCase;

  constructor(db: BunSQLiteDatabase<typeof schema>) {
    // 1. Instantiate infrastructure layer (adapters)
    this.generalSettingsRepository = new DrizzleGeneralSettingsRepository(db);

    // 2. Instantiate application layer (use cases) with injected dependencies
    this.getGeneralSettingsUseCase = new GetGeneralSettingsUseCase(this.generalSettingsRepository);

    this.updateGeneralSettingsUseCase = new UpdateGeneralSettingsUseCase(
      this.generalSettingsRepository,
      scheduler, // Existing scheduler singleton
      createLogger('general-settings') // Existing logger
    );
  }
}
