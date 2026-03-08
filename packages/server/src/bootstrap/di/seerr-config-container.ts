import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '@/server/infrastructure/db/schema';

// Infrastructure layer
import { DrizzleSeerrConfigRepository } from '@/server/infrastructure/repositories/drizzle-seerr-config.repository';
import { HttpSeerrConnectionTester } from '@/server/infrastructure/services/adapters/http-seerr-connection-tester.adapter';
import { LoggingUseCaseDecorator } from '@/server/infrastructure/services/core/logging-usecase.decorator';
import { LoggerService } from '@/server/infrastructure/services/core/logger.adapter';

// Application layer - Use cases
import { GetSeerrConfigUseCase } from '@/server/application/use-cases/seerr/get-seerr-config.usecase';
import { UpdateSeerrConfigUseCase } from '@/server/application/use-cases/seerr/update-seerr-config.usecase';
import { TestSeerrConnectionUseCase } from '@/server/application/use-cases/seerr/test-seerr-connection.usecase';
import { DeleteSeerrConfigUseCase } from '@/server/application/use-cases/seerr/delete-seerr-config.usecase';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type {
  GetSeerrConfigCommand,
  UpdateSeerrConfigCommand,
  DeleteSeerrConfigCommand,
} from 'shared/application/dtos';
import type {
  GetSeerrConfigResponse,
  UpdateSeerrConfigResponse,
  DeleteSeerrConfigResponse,
} from 'shared/application/dtos';
import type {
  TestSeerrConnectionCommand,
  TestSeerrConnectionResponse,
} from 'shared/application/dtos';

/**
 * Dependency Injection Container for Seerr Config Domain
 *
 * Wires together all layers following Clean Architecture:
 * - Infrastructure: Concrete implementations (repositories, services)
 * - Application: Use cases with injected dependencies
 * - Presentation: tRPC routers that consume use cases
 */
export class SeerrConfigContainer {
  // Infrastructure - Repositories & Services (private)
  private readonly seerrConfigRepository: DrizzleSeerrConfigRepository;
  private readonly connectionTester: HttpSeerrConnectionTester;
  private readonly logger: LoggerService;

  // Application - Use Cases (public for consumption by routers)
  public readonly getSeerrConfigUseCase: IUseCase<GetSeerrConfigCommand, GetSeerrConfigResponse>;
  public readonly updateSeerrConfigUseCase: IUseCase<
    UpdateSeerrConfigCommand,
    UpdateSeerrConfigResponse
  >;
  public readonly testSeerrConnectionUseCase: IUseCase<
    TestSeerrConnectionCommand,
    TestSeerrConnectionResponse
  >;
  public readonly deleteSeerrConfigUseCase: IUseCase<
    DeleteSeerrConfigCommand,
    DeleteSeerrConfigResponse
  >;

  constructor(db: BunSQLiteDatabase<typeof schema>) {
    // 1. Instantiate infrastructure layer (adapters)
    this.seerrConfigRepository = new DrizzleSeerrConfigRepository(db);
    this.connectionTester = new HttpSeerrConnectionTester();
    this.logger = new LoggerService('seerr-config');

    // 2. Instantiate use cases wrapped with logging decorator
    this.getSeerrConfigUseCase = new LoggingUseCaseDecorator(
      new GetSeerrConfigUseCase(this.seerrConfigRepository),
      this.logger,
      'GetSeerrConfigUseCase'
    );

    this.updateSeerrConfigUseCase = new LoggingUseCaseDecorator(
      new UpdateSeerrConfigUseCase(this.seerrConfigRepository, this.logger),
      this.logger,
      'UpdateSeerrConfigUseCase'
    );

    this.testSeerrConnectionUseCase = new LoggingUseCaseDecorator(
      new TestSeerrConnectionUseCase(this.connectionTester),
      this.logger,
      'TestSeerrConnectionUseCase'
    );

    this.deleteSeerrConfigUseCase = new LoggingUseCaseDecorator(
      new DeleteSeerrConfigUseCase(this.seerrConfigRepository, this.logger),
      this.logger,
      'DeleteSeerrConfigUseCase'
    );
  }
}
