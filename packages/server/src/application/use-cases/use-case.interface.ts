/**
 * Base interface for all use cases
 *
 * Enforces a consistent contract for use case execution.
 * Enables decorator pattern for cross-cutting concerns (logging, validation, etc.)
 *
 * @template TCommand - The input command/request type
 * @template TResponse - The output response type
 */
export interface IUseCase<TCommand, TResponse> {
  /**
   * Execute the use case with the given command
   *
   * @param command - The input command containing all necessary data
   * @returns Promise resolving to the response
   */
  execute(command: TCommand): Promise<TResponse>;
}
