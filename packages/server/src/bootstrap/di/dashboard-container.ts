import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '@/server/infrastructure/db/schema';

// Infrastructure
import { DrizzleDashboardStatsRepository } from '@/server/infrastructure/repositories/drizzle-dashboard-stats.repository';
import { SeerrStatsAdapter } from '@/server/infrastructure/services/adapters/seerr-stats.adapter';
import { SchedulerInfoAdapter } from '@/server/infrastructure/services/adapters/scheduler-info.adapter';
import { DrizzleSeerrConfigRepository } from '@/server/infrastructure/repositories/drizzle-seerr-config.repository';
import { LoggingUseCaseDecorator } from '@/server/infrastructure/services/core/logging-usecase.decorator';
import { LoggerService } from '@/server/infrastructure/services/core/logger.adapter';

// Use Cases
import { GetDashboardStatsUseCase } from '@/server/application/use-cases/dashboard/get-dashboard-stats.usecase';
import { GetRecentActivityUseCase } from '@/server/application/use-cases/logs/get-recent-activity.usecase';
import { GetPendingRequestsUseCase } from '@/server/application/use-cases/processing/get-pending-requests.usecase';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type { GetDashboardStatsCommand } from 'shared/application/dtos';
import type { DashboardStatsResponse } from 'shared/application/dtos';
import type { GetRecentActivityCommand } from 'shared/application/dtos';
import type { GetRecentActivityResponse } from 'shared/application/dtos';
import type { GetPendingRequestsCommand } from 'shared/application/dtos';
import type { GetPendingRequestsResponse } from 'shared/application/dtos';

/**
 * Dashboard Dependency Injection Container
 *
 * Wires together all layers of the Dashboard feature:
 * - Infrastructure: Repositories and service adapters
 * - Application: Use cases with dependencies injected
 *
 * Follows Dependency Inversion Principle:
 * - Use cases depend on interfaces (not concrete implementations)
 * - Container provides concrete implementations
 *
 * Complex Multi-Dependency Wiring:
 * - GetDashboardStatsUseCase needs: DashboardStatsRepository + SchedulerInfoService
 * - GetRecentActivityUseCase needs: DashboardStatsRepository
 * - GetPendingRequestsUseCase needs: SeerrConfigRepository + SeerrStatsService
 */
export class DashboardContainer {
  // Infrastructure (private)
  private readonly dashboardStatsRepository: DrizzleDashboardStatsRepository;
  private readonly seerrConfigRepository: DrizzleSeerrConfigRepository;
  private readonly seerrStatsService: SeerrStatsAdapter;
  private readonly schedulerInfoService: SchedulerInfoAdapter;
  private readonly logger: LoggerService;

  // Application (public)
  public readonly getDashboardStatsUseCase: IUseCase<
    GetDashboardStatsCommand,
    DashboardStatsResponse
  >;
  public readonly getRecentActivityUseCase: IUseCase<
    GetRecentActivityCommand,
    GetRecentActivityResponse
  >;
  public readonly getPendingRequestsUseCase: IUseCase<
    GetPendingRequestsCommand,
    GetPendingRequestsResponse
  >;

  constructor(db: BunSQLiteDatabase<typeof schema>) {
    // 1. Instantiate infrastructure layer
    this.dashboardStatsRepository = new DrizzleDashboardStatsRepository(db);
    this.seerrConfigRepository = new DrizzleSeerrConfigRepository(db);
    this.seerrStatsService = new SeerrStatsAdapter();
    this.schedulerInfoService = new SchedulerInfoAdapter();
    this.logger = new LoggerService('dashboard');

    // 2. Instantiate use cases wrapped with logging decorator
    this.getDashboardStatsUseCase = new LoggingUseCaseDecorator(
      new GetDashboardStatsUseCase(this.dashboardStatsRepository, this.schedulerInfoService),
      this.logger,
      'GetDashboardStatsUseCase'
    );

    this.getRecentActivityUseCase = new LoggingUseCaseDecorator(
      new GetRecentActivityUseCase(this.dashboardStatsRepository),
      this.logger,
      'GetRecentActivityUseCase'
    );

    this.getPendingRequestsUseCase = new LoggingUseCaseDecorator(
      new GetPendingRequestsUseCase(this.seerrConfigRepository, this.seerrStatsService),
      this.logger,
      'GetPendingRequestsUseCase'
    );
  }
}
