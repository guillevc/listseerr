import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '@/infrastructure/db/schema';

// Infrastructure layer
import { DrizzleMediaListRepository } from '@/infrastructure/repositories/drizzle-media-list.repository';
import { ListUrlParserService } from '@/infrastructure/services/adapters/list-url-parser.service';
import { SchedulerService } from '@/infrastructure/services/core/scheduler.service';
import { LoggerService } from '@/infrastructure/services/core/logger.service';

// Application layer - Use cases
import { GetAllMediaListsUseCase } from '@/application/use-cases/lists/get-all-media-lists.usecase';
import { GetMediaListByIdUseCase } from '@/application/use-cases/lists/get-media-list-by-id.usecase';
import { CreateMediaListUseCase } from '@/application/use-cases/lists/create-media-list.usecase';
import { UpdateMediaListUseCase } from '@/application/use-cases/lists/update-media-list.usecase';
import { DeleteMediaListUseCase } from '@/application/use-cases/lists/delete-media-list.usecase';
import { ToggleListEnabledUseCase } from '@/application/use-cases/lists/toggle-list-enabled.usecase';
import { EnableAllListsUseCase } from '@/application/use-cases/lists/enable-all-lists.usecase';
import type { IUseCase } from '@/application/use-cases/use-case.interface';
import type {
  GetAllMediaListsCommand,
  GetMediaListByIdCommand,
  CreateMediaListCommand,
  UpdateMediaListCommand,
  DeleteMediaListCommand,
  ToggleListEnabledCommand,
  EnableAllListsCommand,
} from 'shared/application/dtos/media-list/commands.dto';
import type {
  GetAllMediaListsResponse,
  GetMediaListByIdResponse,
  CreateMediaListResponse,
  UpdateMediaListResponse,
  DeleteMediaListResponse,
  ToggleListEnabledResponse,
  EnableAllListsResponse,
} from 'shared/application/dtos/media-list/responses.dto';

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
  private readonly schedulerService: SchedulerService;
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
    this.schedulerService = new SchedulerService();
    this.logger = new LoggerService('lists');

    // 2. Instantiate application layer (use cases) with injected dependencies
    this.getAllMediaListsUseCase = new GetAllMediaListsUseCase(this.mediaListRepository);

    this.getMediaListByIdUseCase = new GetMediaListByIdUseCase(this.mediaListRepository);

    this.createMediaListUseCase = new CreateMediaListUseCase(
      this.mediaListRepository,
      this.urlParserService,
      this.schedulerService,
      this.logger
    );

    this.updateMediaListUseCase = new UpdateMediaListUseCase(
      this.mediaListRepository,
      this.urlParserService,
      this.schedulerService,
      this.logger
    );

    this.deleteMediaListUseCase = new DeleteMediaListUseCase(
      this.mediaListRepository,
      this.schedulerService,
      this.logger
    );

    this.toggleListEnabledUseCase = new ToggleListEnabledUseCase(
      this.mediaListRepository,
      this.schedulerService,
      this.logger
    );

    this.enableAllListsUseCase = new EnableAllListsUseCase(
      this.mediaListRepository,
      this.schedulerService,
      this.logger
    );
  }
}
