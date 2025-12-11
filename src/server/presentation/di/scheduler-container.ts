// Infrastructure
import { SchedulerService } from '../../infrastructure/services/scheduler.service';

// Use Cases
import { GetScheduledJobsUseCase } from '../../application/use-cases/get-scheduled-jobs.usecase';
import { ReloadSchedulerUseCase } from '../../application/use-cases/reload-scheduler.usecase';

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
  private readonly schedulerService: SchedulerService;

  // Application (public)
  public readonly getScheduledJobsUseCase: GetScheduledJobsUseCase;
  public readonly reloadSchedulerUseCase: ReloadSchedulerUseCase;

  constructor() {
    // 1. Instantiate infrastructure layer
    this.schedulerService = new SchedulerService();

    // 2. Instantiate use cases with dependencies injected
    this.getScheduledJobsUseCase = new GetScheduledJobsUseCase(this.schedulerService);
    this.reloadSchedulerUseCase = new ReloadSchedulerUseCase(this.schedulerService);
  }
}
