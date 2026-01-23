// Infrastructure
import {
  Scheduler,
  SchedulerServiceAdapter,
  type SchedulerDependencies,
} from '@/server/infrastructure/services/core/scheduler.adapter';
import { LoggingUseCaseDecorator } from '@/server/infrastructure/services/core/logging-usecase.decorator';
import { LoggerService } from '@/server/infrastructure/services/core/logger.adapter';
import type { ISchedulerService } from '@/server/application/services/core/scheduler.service.interface';

// Use Cases
import { GetScheduledJobsUseCase } from '@/server/application/use-cases/scheduler/get-scheduled-jobs.usecase';
import { ReloadSchedulerUseCase } from '@/server/application/use-cases/processing/reload-scheduler.usecase';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type { GetScheduledJobsCommand } from 'shared/application/dtos';
import type { GetScheduledJobsResponse } from 'shared/application/dtos';
import type { ReloadSchedulerCommand } from 'shared/application/dtos';
import type { ReloadSchedulerResponse } from 'shared/application/dtos';

/**
 * Scheduler Dependency Injection Container
 *
 * Wires together all layers of the Scheduler feature:
 * - Infrastructure: Scheduler and SchedulerServiceAdapter (created via DI)
 * - Application: Use cases with dependencies injected
 *
 * Follows Dependency Inversion Principle:
 * - Use cases depend on ISchedulerService interface (not concrete service)
 * - Container provides concrete implementation
 */
export class SchedulerContainer {
  // Infrastructure (private)
  private readonly logger: LoggerService;
  private readonly scheduler: Scheduler;
  public readonly schedulerService: ISchedulerService;

  // Application (public)
  public readonly getScheduledJobsUseCase: IUseCase<
    GetScheduledJobsCommand,
    GetScheduledJobsResponse
  >;
  public readonly reloadSchedulerUseCase: IUseCase<ReloadSchedulerCommand, ReloadSchedulerResponse>;

  constructor(deps: SchedulerDependencies) {
    // 1. Instantiate infrastructure layer
    this.logger = new LoggerService('scheduler');

    // 2. Create Scheduler with all dependencies injected
    this.scheduler = new Scheduler({
      ...deps,
      logger: this.logger,
    });
    this.schedulerService = new SchedulerServiceAdapter(this.scheduler);

    // 3. Instantiate use cases wrapped with logging decorator
    this.getScheduledJobsUseCase = new LoggingUseCaseDecorator(
      new GetScheduledJobsUseCase(this.schedulerService),
      this.logger,
      'GetScheduledJobsUseCase'
    );
    this.reloadSchedulerUseCase = new LoggingUseCaseDecorator(
      new ReloadSchedulerUseCase(this.schedulerService),
      this.logger,
      'ReloadSchedulerUseCase'
    );
  }
}
