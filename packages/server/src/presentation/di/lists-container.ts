import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '../../db/schema';

// Infrastructure layer
import { DrizzleMediaListRepository } from '../../infrastructure/repositories/drizzle-media-list.repository';
import { ListUrlParserService } from '../../infrastructure/services/list-url-parser.service';
import { SchedulerService } from '../../infrastructure/services/scheduler.service';
import { LoggerService } from '../../infrastructure/services/logger.service';

// Application layer - Use cases
import { GetAllMediaListsUseCase } from '../../application/use-cases/get-all-media-lists.usecase';
import { GetMediaListByIdUseCase } from '../../application/use-cases/get-media-list-by-id.usecase';
import { CreateMediaListUseCase } from '../../application/use-cases/create-media-list.usecase';
import { UpdateMediaListUseCase } from '../../application/use-cases/update-media-list.usecase';
import { DeleteMediaListUseCase } from '../../application/use-cases/delete-media-list.usecase';
import { ToggleListEnabledUseCase } from '../../application/use-cases/toggle-list-enabled.usecase';
import { EnableAllListsUseCase } from '../../application/use-cases/enable-all-lists.usecase';

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
  public readonly getAllMediaListsUseCase: GetAllMediaListsUseCase;
  public readonly getMediaListByIdUseCase: GetMediaListByIdUseCase;
  public readonly createMediaListUseCase: CreateMediaListUseCase;
  public readonly updateMediaListUseCase: UpdateMediaListUseCase;
  public readonly deleteMediaListUseCase: DeleteMediaListUseCase;
  public readonly toggleListEnabledUseCase: ToggleListEnabledUseCase;
  public readonly enableAllListsUseCase: EnableAllListsUseCase;

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
