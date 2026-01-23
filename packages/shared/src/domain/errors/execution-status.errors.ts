import { DomainError } from './domain.error';

/**
 * Invalid Execution Status Error
 *
 * Thrown when an invalid execution status is provided.
 * Valid execution statuses: running, success, error
 */
export class InvalidExecutionStatusError extends DomainError {
  readonly code = 'INVALID_EXECUTION_STATUS_ERROR' as const;

  constructor(status: string) {
    super(`Invalid execution status: ${status}. Must be one of: running, success, error`);
  }
}
