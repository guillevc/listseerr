import { LoggerService } from '../logger.service';

/**
 * LogExecution Method Decorator
 *
 * Adds structured logging to use case execute methods.
 * Logs entry (debug), success (info), and errors (error) with timing.
 *
 * Benefits:
 * - No manual wrapping in DI containers
 * - Logging declaration lives with the method
 * - Impossible to forget to add logging
 * - Type-safe (preserves method signature)
 *
 * Usage:
 * ```typescript
 * export class CreateMediaListUseCase {
 *   @LogExecution('lists:create')
 *   async execute(command: CreateMediaListCommand): Promise<CreateMediaListResponse> {
 *     // business logic
 *   }
 * }
 * ```
 *
 * @param context - Logger context (e.g., 'lists:create', 'processing:batch')
 */
export function LogExecution(context: string) {
  return function (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _target: any,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;
    const logger = new LoggerService(context);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor.value = async function (this: any, ...args: any[]) {
      const startTime = Date.now();
      const useCaseName = this.constructor.name;
      const command = args[0];

      // Log entry with full command (structured logging)
      logger.debug({ useCaseName, command }, `Executing ${useCaseName}`);

      try {
        const result = await originalMethod.apply(this, args);

        // Log success with duration
        const duration = Date.now() - startTime;
        logger.info({ useCaseName, duration }, `Completed ${useCaseName} in ${duration}ms`);

        return result;
      } catch (error) {
        // Log error with stack trace
        const duration = Date.now() - startTime;
        logger.error(
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
    };

    return descriptor;
  };
}
