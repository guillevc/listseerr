import type { IUseCase } from '../../../../application/use-cases/use-case.interface';
import type { Logger } from 'pino';
import { createLogger } from '../logger.service';

/**
 * LoggingUseCaseDecorator
 *
 * Decorator that adds logging to any use case without violating Clean Architecture.
 * Implements the Decorator Pattern (Gang of Four).
 *
 * Benefits:
 * - Use cases remain pure (no infrastructure dependencies)
 * - Logging is transparent (applied by DI container)
 * - Logs complete command objects (structured logging)
 * - Measures execution time
 * - Handles errors gracefully
 *
 * Usage (in DI container):
 * ```typescript
 * const actualUseCase = new GetPendingRequestsUseCase(...);
 * const decoratedUseCase = new LoggingUseCaseDecorator(
 *   actualUseCase,
 *   'dashboard:pending-requests'
 * );
 * ```
 *
 * @template TCommand - The input command/request type
 * @template TResponse - The output response type
 */
export class LoggingUseCaseDecorator<TCommand, TResponse> implements IUseCase<TCommand, TResponse> {
  private readonly logger: Logger;

  constructor(
    private readonly wrappedUseCase: IUseCase<TCommand, TResponse>,
    context: string
  ) {
    this.logger = createLogger(context);
  }

  async execute(command: TCommand): Promise<TResponse> {
    const startTime = Date.now();
    const useCaseName = this.wrappedUseCase.constructor.name;

    // Log entry with full command (structured logging)
    this.logger.debug({ useCaseName, command }, `Executing ${useCaseName}`);

    try {
      const result = await this.wrappedUseCase.execute(command);

      // Log success
      const duration = Date.now() - startTime;
      this.logger.info({ useCaseName, duration }, `Completed ${useCaseName} in ${duration}ms`);

      return result;
    } catch (error) {
      // Log error
      const duration = Date.now() - startTime;
      this.logger.error(
        {
          useCaseName,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
        `Failed ${useCaseName} after ${duration}ms`
      );

      throw error; // Re-throw to preserve error handling
    }
  }
}
