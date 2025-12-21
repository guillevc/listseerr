import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '@/server/infrastructure/db/schema';

// Infrastructure layer
import { DrizzleJellyseerrConfigRepository } from '@/server/infrastructure/repositories/drizzle-jellyseerr-config.repository';
import { HttpJellyseerrConnectionTester } from '@/server/infrastructure/services/adapters/http-jellyseerr-connection-tester.adapter';
import { LoggingUseCaseDecorator } from '@/server/infrastructure/services/core/logging-usecase.decorator';
import { LoggerService } from '@/server/infrastructure/services/core/logger.adapter';

// Application layer - Use cases
import { GetJellyseerrConfigUseCase } from '@/server/application/use-cases/jellyseerr/get-jellyseerr-config.usecase';
import { UpdateJellyseerrConfigUseCase } from '@/server/application/use-cases/jellyseerr/update-jellyseerr-config.usecase';
import { TestJellyseerrConnectionUseCase } from '@/server/application/use-cases/jellyseerr/test-jellyseerr-connection.usecase';
import { DeleteJellyseerrConfigUseCase } from '@/server/application/use-cases/jellyseerr/delete-jellyseerr-config.usecase';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type {
  GetJellyseerrConfigCommand,
  UpdateJellyseerrConfigCommand,
  DeleteJellyseerrConfigCommand,
} from 'shared/application/dtos';
import type {
  GetJellyseerrConfigResponse,
  UpdateJellyseerrConfigResponse,
  DeleteJellyseerrConfigResponse,
} from 'shared/application/dtos';
import type {
  TestJellyseerrConnectionCommand,
  TestJellyseerrConnectionResponse,
} from 'shared/application/dtos';

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

    // 2. Instantiate use cases wrapped with logging decorator
    this.getJellyseerrConfigUseCase = new LoggingUseCaseDecorator(
      new GetJellyseerrConfigUseCase(this.jellyseerrConfigRepository),
      this.logger,
      'GetJellyseerrConfigUseCase'
    );

    this.updateJellyseerrConfigUseCase = new LoggingUseCaseDecorator(
      new UpdateJellyseerrConfigUseCase(this.jellyseerrConfigRepository, this.logger),
      this.logger,
      'UpdateJellyseerrConfigUseCase'
    );

    this.testJellyseerrConnectionUseCase = new LoggingUseCaseDecorator(
      new TestJellyseerrConnectionUseCase(this.connectionTester),
      this.logger,
      'TestJellyseerrConnectionUseCase'
    );

    this.deleteJellyseerrConfigUseCase = new LoggingUseCaseDecorator(
      new DeleteJellyseerrConfigUseCase(this.jellyseerrConfigRepository, this.logger),
      this.logger,
      'DeleteJellyseerrConfigUseCase'
    );
  }
}
