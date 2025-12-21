import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '@/server/infrastructure/db/schema';

// Infrastructure layer
import { DrizzleMediaListRepository } from '@/server/infrastructure/repositories/drizzle-media-list.repository';
import { ListUrlParserService } from '@/server/infrastructure/services/adapters/list-url-parser.adapter';
import { LoggingUseCaseDecorator } from '@/server/infrastructure/services/core/logging-usecase.decorator';
import { LoggerService } from '@/server/infrastructure/services/core/logger.adapter';

// Application layer - Use cases
import { GetAllMediaListsUseCase } from '@/server/application/use-cases/lists/get-all-media-lists.usecase';
import { GetMediaListByIdUseCase } from '@/server/application/use-cases/lists/get-media-list-by-id.usecase';
import { CreateMediaListUseCase } from '@/server/application/use-cases/lists/create-media-list.usecase';
import { UpdateMediaListUseCase } from '@/server/application/use-cases/lists/update-media-list.usecase';
import { DeleteMediaListUseCase } from '@/server/application/use-cases/lists/delete-media-list.usecase';
import { ToggleListEnabledUseCase } from '@/server/application/use-cases/lists/toggle-list-enabled.usecase';
import { EnableAllListsUseCase } from '@/server/application/use-cases/lists/enable-all-lists.usecase';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type {
  GetAllMediaListsCommand,
  GetMediaListByIdCommand,
  CreateMediaListCommand,
  UpdateMediaListCommand,
  DeleteMediaListCommand,
  ToggleListEnabledCommand,
  EnableAllListsCommand,
} from 'shared/application/dtos';
import type {
  GetAllMediaListsResponse,
  GetMediaListByIdResponse,
  CreateMediaListResponse,
  UpdateMediaListResponse,
  DeleteMediaListResponse,
  ToggleListEnabledResponse,
  EnableAllListsResponse,
} from 'shared/application/dtos';

/**
 * Dependency Injection Container for Lists Management Domain
 *
 * Wires together all layers following Clean Architecture:
 * - Infrastructure: Concrete implementations (repositories, services)
 * - Application: Use cases with injected dependencies
 * - Presentation: tRPC routers that consume use cases
 *
 * This container implements the Dependency Inversion Principle:
 * Use cases depend on interfaces, this container provides concrete implementations.
 */
export class ListsContainer {
  // Infrastructure - Repositories
  private readonly mediaListRepository: DrizzleMediaListRepository;

  // Infrastructure - Services
  private readonly urlParserService: ListUrlParserService;
  private readonly logger: LoggerService;

  // Application - Use Cases (public for consumption by routers)
  public readonly getAllMediaListsUseCase: IUseCase<
    GetAllMediaListsCommand,
    GetAllMediaListsResponse
  >;
  public readonly getMediaListByIdUseCase: IUseCase<
    GetMediaListByIdCommand,
    GetMediaListByIdResponse
  >;
  public readonly createMediaListUseCase: IUseCase<CreateMediaListCommand, CreateMediaListResponse>;
  public readonly updateMediaListUseCase: IUseCase<UpdateMediaListCommand, UpdateMediaListResponse>;
  public readonly deleteMediaListUseCase: IUseCase<DeleteMediaListCommand, DeleteMediaListResponse>;
  public readonly toggleListEnabledUseCase: IUseCase<
    ToggleListEnabledCommand,
    ToggleListEnabledResponse
  >;
  public readonly enableAllListsUseCase: IUseCase<EnableAllListsCommand, EnableAllListsResponse>;

  constructor(db: BunSQLiteDatabase<typeof schema>) {
    // 1. Instantiate infrastructure layer (adapters)
    this.mediaListRepository = new DrizzleMediaListRepository(db);
    this.urlParserService = new ListUrlParserService();
    this.logger = new LoggerService('lists');

    // 2. Instantiate use cases wrapped with logging decorator
    this.getAllMediaListsUseCase = new LoggingUseCaseDecorator(
      new GetAllMediaListsUseCase(this.mediaListRepository),
      this.logger,
      'GetAllMediaListsUseCase'
    );

    this.getMediaListByIdUseCase = new LoggingUseCaseDecorator(
      new GetMediaListByIdUseCase(this.mediaListRepository),
      this.logger,
      'GetMediaListByIdUseCase'
    );

    this.createMediaListUseCase = new LoggingUseCaseDecorator(
      new CreateMediaListUseCase(this.mediaListRepository, this.urlParserService, this.logger),
      this.logger,
      'CreateMediaListUseCase'
    );

    this.updateMediaListUseCase = new LoggingUseCaseDecorator(
      new UpdateMediaListUseCase(this.mediaListRepository, this.urlParserService, this.logger),
      this.logger,
      'UpdateMediaListUseCase'
    );

    this.deleteMediaListUseCase = new LoggingUseCaseDecorator(
      new DeleteMediaListUseCase(this.mediaListRepository, this.logger),
      this.logger,
      'DeleteMediaListUseCase'
    );

    this.toggleListEnabledUseCase = new LoggingUseCaseDecorator(
      new ToggleListEnabledUseCase(this.mediaListRepository, this.logger),
      this.logger,
      'ToggleListEnabledUseCase'
    );

    this.enableAllListsUseCase = new LoggingUseCaseDecorator(
      new EnableAllListsUseCase(this.mediaListRepository, this.logger),
      this.logger,
      'EnableAllListsUseCase'
    );
  }
}
