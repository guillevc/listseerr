/**
 * Base Domain Error
 *
 * All domain-specific errors should extend this class.
 * This allows the presentation layer to distinguish between
 * domain validation errors and unexpected runtime errors.
 */
export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
