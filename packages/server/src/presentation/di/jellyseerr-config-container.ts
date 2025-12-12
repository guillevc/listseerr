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
import type { IUseCase } from '../../application/use-cases/use-case.interface';
import type {
  GetJellyseerrConfigCommand,
  UpdateJellyseerrConfigCommand,
  DeleteJellyseerrConfigCommand,
} from 'shared/application/dtos/jellyseerr-config/commands.dto';
import type {
  GetJellyseerrConfigResponse,
  UpdateJellyseerrConfigResponse,
  DeleteJellyseerrConfigResponse,
} from 'shared/application/dtos/jellyseerr-config/responses.dto';
import type {
  TestJellyseerrConnectionCommand,
  TestJellyseerrConnectionResponse,
} from 'shared/application/dtos/diagnostics/jellyseerr-connection-test.dto';

// Infrastructure services (existing)
import { LoggerService } from '../../infrastructure/services/core/logger.service';

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
  private readonly logger: LoggerService;

  // Application - Use Cases (public for consumption by routers)
  public readonly getJellyseerrConfigUseCase: IUseCase<
    GetJellyseerrConfigCommand,
    GetJellyseerrConfigResponse
  >;
  public readonly updateJellyseerrConfigUseCase: IUseCase<
    UpdateJellyseerrConfigCommand,
    UpdateJellyseerrConfigResponse
  >;
  public readonly testJellyseerrConnectionUseCase: IUseCase<
    TestJellyseerrConnectionCommand,
    TestJellyseerrConnectionResponse
  >;
  public readonly deleteJellyseerrConfigUseCase: IUseCase<
    DeleteJellyseerrConfigCommand,
    DeleteJellyseerrConfigResponse
  >;

  constructor(db: BunSQLiteDatabase<typeof schema>) {
    // 1. Instantiate infrastructure layer (adapters)
    this.jellyseerrConfigRepository = new DrizzleJellyseerrConfigRepository(db);
    this.connectionTester = new HttpJellyseerrConnectionTester();
    this.logger = new LoggerService('jellyseerr-config');

    // 2. Instantiate application layer (use cases) with injected dependencies
    this.getJellyseerrConfigUseCase = new GetJellyseerrConfigUseCase(
      this.jellyseerrConfigRepository
    );

    this.updateJellyseerrConfigUseCase = new UpdateJellyseerrConfigUseCase(
      this.jellyseerrConfigRepository,
      this.logger
    );

    this.testJellyseerrConnectionUseCase = new TestJellyseerrConnectionUseCase(
      this.connectionTester
    );

    this.deleteJellyseerrConfigUseCase = new DeleteJellyseerrConfigUseCase(
      this.jellyseerrConfigRepository,
      this.logger
    );
  }
}
