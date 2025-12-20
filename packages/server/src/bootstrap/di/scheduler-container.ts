// Infrastructure
import { schedulerService } from '@/server/infrastructure/services/core/scheduler.adapter';
import { LoggingUseCaseDecorator } from '@/server/infrastructure/services/core/logging-usecase.decorator';
import { LoggerService } from '@/server/infrastructure/services/core/logger.adapter';

// Use Cases
import { GetScheduledJobsUseCase } from '@/server/application/use-cases/scheduler/get-scheduled-jobs.usecase';
import { ReloadSchedulerUseCase } from '@/server/application/use-cases/processing/reload-scheduler.usecase';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type { GetScheduledJobsCommand } from 'shared/application/dtos/scheduler/commands.dto';
import type { GetScheduledJobsResponse } from 'shared/application/dtos/scheduler/responses.dto';
import type { ReloadSchedulerCommand } from 'shared/application/dtos/scheduler/commands.dto';
import type { ReloadSchedulerResponse } from 'shared/application/dtos/scheduler/responses.dto';

/**
 * Scheduler Dependency Injection Container
 *
 * Wires together all layers of the Scheduler feature:
 * - Infrastructure: SchedulerService (wraps singleton)
 * - Application: Use cases with dependencies injected
 *
 * Follows Dependency Inversion Principle:
 * - Use cases depend on ISchedulerService interface (not concrete service)
 * - Container provides concrete implementation
 */
export class SchedulerContainer {
  // Infrastructure (private)
  private readonly logger: LoggerService;

  // Application (public)
  public readonly getScheduledJobsUseCase: IUseCase<
    GetScheduledJobsCommand,
    GetScheduledJobsResponse
  >;
  public readonly reloadSchedulerUseCase: IUseCase<ReloadSchedulerCommand, ReloadSchedulerResponse>;

  constructor() {
    // 1. Instantiate infrastructure layer
    this.logger = new LoggerService('scheduler');

    // 2. Instantiate use cases wrapped with logging decorator (using singleton schedulerService)
    this.getScheduledJobsUseCase = new LoggingUseCaseDecorator(
      new GetScheduledJobsUseCase(schedulerService),
      this.logger,
      'GetScheduledJobsUseCase'
    );
    this.reloadSchedulerUseCase = new LoggingUseCaseDecorator(
      new ReloadSchedulerUseCase(schedulerService),
      this.logger,
      'ReloadSchedulerUseCase'
    );
  }
}
