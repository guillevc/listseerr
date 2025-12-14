// Infrastructure
import { LogBufferAdapter } from '@/server/infrastructure/services/adapters/log-buffer.adapter';
import { LoggingUseCaseDecorator } from '@/server/infrastructure/services/core/logging-usecase.decorator';
import { LoggerService } from '@/server/infrastructure/services/core/logger.service';

// Use Cases
import { GetLogsUseCase } from '@/server/application/use-cases/logs/get-logs.usecase';
import { ClearLogsUseCase } from '@/server/application/use-cases/logs/clear-logs.usecase';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
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

    // 2. Instantiate use cases wrapped with logging decorator
    this.getLogsUseCase = new LoggingUseCaseDecorator(
      new GetLogsUseCase(this.logBufferService),
      new LoggerService('logs'),
      'GetLogsUseCase'
    );
    this.clearLogsUseCase = new LoggingUseCaseDecorator(
      new ClearLogsUseCase(this.logBufferService),
      new LoggerService('logs'),
      'ClearLogsUseCase'
    );
  }
}
