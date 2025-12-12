import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '../../infrastructure/db/schema';

// Infrastructure layer
import { DrizzleJellyseerrConfigRepository } from '../../infrastructure/repositories/drizzle-jellyseerr-config.repository';
import { HttpJellyseerrConnectionTester } from '../../infrastructure/services/adapters/http-jellyseerr-connection-tester.service';

// Application layer - Use cases
import { GetJellyseerrConfigUseCase } from '../../application/use-cases/jellyseerr/get-jellyseerr-config.usecase';
import { UpdateJellyseerrConfigUseCase } from '../../application/use-cases/jellyseerr/update-jellyseerr-config.usecase';
import { TestJellyseerrConnectionUseCase } from '../../application/use-cases/jellyseerr/test-jellyseerr-connection.usecase';
import { DeleteJellyseerrConfigUseCase } from '../../application/use-cases/jellyseerr/delete-jellyseerr-config.usecase';

// Infrastructure services (existing)
import { createLogger } from '../../infrastructure/services/core/logger.service';

/**
 * Dependency Injection Container for Jellyseerr Config Domain
 *
 * Wires together all layers following Clean Architecture:
 * - Infrastructure: Concrete implementations (repositories, services)
 * - Application: Use cases with injected dependencies
 * - Presentation: tRPC routers that consume use cases
 */
export class JellyseerrConfigContainer {
  // Infrastructure - Repositories & Services (private)
  private readonly jellyseerrConfigRepository: DrizzleJellyseerrConfigRepository;
  private readonly connectionTester: HttpJellyseerrConnectionTester;

  // Application - Use Cases (public for consumption by routers)
  public readonly getJellyseerrConfigUseCase: GetJellyseerrConfigUseCase;
  public readonly updateJellyseerrConfigUseCase: UpdateJellyseerrConfigUseCase;
  public readonly testJellyseerrConnectionUseCase: TestJellyseerrConnectionUseCase;
  public readonly deleteJellyseerrConfigUseCase: DeleteJellyseerrConfigUseCase;

  constructor(db: BunSQLiteDatabase<typeof schema>) {
    // 1. Instantiate infrastructure layer (adapters)
    this.jellyseerrConfigRepository = new DrizzleJellyseerrConfigRepository(db);
    this.connectionTester = new HttpJellyseerrConnectionTester();

    // 2. Instantiate application layer (use cases) with injected dependencies
    this.getJellyseerrConfigUseCase = new GetJellyseerrConfigUseCase(
      this.jellyseerrConfigRepository
    );

    this.updateJellyseerrConfigUseCase = new UpdateJellyseerrConfigUseCase(
      this.jellyseerrConfigRepository,
      createLogger('jellyseerr-config')
    );

    this.testJellyseerrConnectionUseCase = new TestJellyseerrConnectionUseCase(
      this.connectionTester
    );

    this.deleteJellyseerrConfigUseCase = new DeleteJellyseerrConfigUseCase(
      this.jellyseerrConfigRepository,
      createLogger('jellyseerr-config')
    );
  }
}
