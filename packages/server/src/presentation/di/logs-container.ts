// Infrastructure
import { LogBufferAdapter } from '../../infrastructure/services/log-buffer.adapter';

// Use Cases
import { GetLogsUseCase } from '../../application/use-cases/logs/get-logs.usecase';
import { ClearLogsUseCase } from '../../application/use-cases/logs/clear-logs.usecase';

/**
 * Logs Dependency Injection Container
 *
 * Wires together all layers of the Logs feature:
 * - Infrastructure: LogBufferAdapter (wraps singleton)
 * - Application: Use cases with dependencies injected
 *
 * Follows Dependency Inversion Principle:
 * - Use cases depend on ILogBufferService interface (not concrete adapter)
 * - Container provides concrete implementation
 */
export class LogsContainer {
  // Infrastructure (private)
  private readonly logBufferService: LogBufferAdapter;

  // Application (public)
  public readonly getLogsUseCase: GetLogsUseCase;
  public readonly clearLogsUseCase: ClearLogsUseCase;

  constructor() {
    // 1. Instantiate infrastructure layer
    this.logBufferService = new LogBufferAdapter();

    // 2. Instantiate use cases with dependencies injected
    this.getLogsUseCase = new GetLogsUseCase(this.logBufferService);
    this.clearLogsUseCase = new ClearLogsUseCase(this.logBufferService);
  }
}
