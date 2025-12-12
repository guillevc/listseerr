import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '../../db/schema';

// Infrastructure
import { DrizzleDashboardStatsRepository } from '../../infrastructure/repositories/drizzle-dashboard-stats.repository';
import { JellyseerrStatsAdapter } from '../../infrastructure/services/jellyseerr-stats.adapter';
import { SchedulerInfoAdapter } from '../../infrastructure/services/scheduler-info.adapter';
import { DrizzleJellyseerrConfigRepository } from '../../infrastructure/repositories/drizzle-jellyseerr-config.repository';

// Use Cases
import { GetDashboardStatsUseCase } from '../../application/use-cases/get-dashboard-stats.usecase';
import { GetRecentActivityUseCase } from '../../application/use-cases/get-recent-activity.usecase';
import { GetPendingRequestsUseCase } from '../../application/use-cases/get-pending-requests.usecase';

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
 * - GetPendingRequestsUseCase needs: JellyseerrConfigRepository + JellyseerrStatsService
 */
export class DashboardContainer {
  // Infrastructure (private)
  private readonly dashboardStatsRepository: DrizzleDashboardStatsRepository;
  private readonly jellyseerrConfigRepository: DrizzleJellyseerrConfigRepository;
  private readonly jellyseerrStatsService: JellyseerrStatsAdapter;
  private readonly schedulerInfoService: SchedulerInfoAdapter;

  // Application (public)
  public readonly getDashboardStatsUseCase: GetDashboardStatsUseCase;
  public readonly getRecentActivityUseCase: GetRecentActivityUseCase;
  public readonly getPendingRequestsUseCase: GetPendingRequestsUseCase;

  constructor(db: BunSQLiteDatabase<typeof schema>) {
    // 1. Instantiate infrastructure layer
    this.dashboardStatsRepository = new DrizzleDashboardStatsRepository(db);
    this.jellyseerrConfigRepository = new DrizzleJellyseerrConfigRepository(db);
    this.jellyseerrStatsService = new JellyseerrStatsAdapter();
    this.schedulerInfoService = new SchedulerInfoAdapter();

    // 2. Instantiate use cases with dependencies injected
    this.getDashboardStatsUseCase = new GetDashboardStatsUseCase(
      this.dashboardStatsRepository,
      this.schedulerInfoService
    );

    this.getRecentActivityUseCase = new GetRecentActivityUseCase(this.dashboardStatsRepository);

    this.getPendingRequestsUseCase = new GetPendingRequestsUseCase(
      this.jellyseerrConfigRepository,
      this.jellyseerrStatsService
    );
  }
}
