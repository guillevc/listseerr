/**
 * Invalid Execution Status Error
 *
 * Thrown when an invalid execution status is provided.
 * Valid execution statuses: running, success, error
 */
export class InvalidExecutionStatusError extends Error {
  constructor(status: string) {
    super(`Invalid execution status: ${status}. Must be one of: running, success, error`);
    this.name = 'InvalidExecutionStatusError';
  }
}
