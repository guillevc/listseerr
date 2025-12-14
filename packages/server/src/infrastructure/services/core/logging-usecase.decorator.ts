import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type { ILogger } from '@/server/application/services/logger.interface';

/**
 * Gang of Four Decorator Pattern for Use Case Logging
 *
 * Wraps any use case to add structured logging:
 * - Entry logging (debug) with command
 * - Success logging (info) with duration
 * - Error logging (error) with message and duration
 *
 * Applied at composition root (DI containers) to keep
 * Application layer use cases pure and infrastructure-agnostic.
 */
export class LoggingUseCaseDecorator<TCommand, TResponse> implements IUseCase<TCommand, TResponse> {
  constructor(
    private readonly inner: IUseCase<TCommand, TResponse>,
    private readonly logger: ILogger,
    private readonly useCaseName: string
  ) {}

  async execute(command: TCommand): Promise<TResponse> {
    const startTime = Date.now();
    this.logger.debug({ command }, `Executing ${this.useCaseName}`);

    try {
      const result = await this.inner.execute(command);
      const duration = Date.now() - startTime;
      this.logger.info({ duration }, `Completed ${this.useCaseName} in ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          duration,
        },
        `Failed ${this.useCaseName} after ${duration}ms`
      );
      throw error;
    }
  }
}
