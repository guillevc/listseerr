// Infrastructure
import { LogBufferAdapter } from '../../infrastructure/services/adapters/log-buffer.adapter';
import { LoggingUseCaseDecorator } from '../../infrastructure/services/core/decorators/logging-use-case.decorator';

// Use Cases
import { GetLogsUseCase } from '../../application/use-cases/logs/get-logs.usecase';
import { ClearLogsUseCase } from '../../application/use-cases/logs/clear-logs.usecase';
import type { IUseCase } from '../../application/use-cases/use-case.interface';
import type { GetLogsCommand, ClearLogsCommand } from 'shared/application/dtos/logs/commands.dto';
import type {
  GetLogsResponse,
  ClearLogsResponse,
} from 'shared/application/dtos/logs/responses.dto';

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
  public readonly getLogsUseCase: IUseCase<GetLogsCommand, GetLogsResponse>;
  public readonly clearLogsUseCase: IUseCase<ClearLogsCommand, ClearLogsResponse>;

  constructor() {
    // 1. Instantiate infrastructure layer
    this.logBufferService = new LogBufferAdapter();

    // 2. Instantiate use cases with dependencies injected
    const actualGetLogsUseCase = new GetLogsUseCase(this.logBufferService);
    this.getLogsUseCase = new LoggingUseCaseDecorator(actualGetLogsUseCase, 'logs:get');

    const actualClearLogsUseCase = new ClearLogsUseCase(this.logBufferService);
    this.clearLogsUseCase = new LoggingUseCaseDecorator(actualClearLogsUseCase, 'logs:clear');
  }
}
