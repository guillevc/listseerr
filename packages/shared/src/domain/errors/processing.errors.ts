import { DomainError } from './domain.error';

/**
 * Thrown when a processing execution cannot be found
 */
export class ExecutionNotFoundError extends DomainError {
  constructor(executionId: number) {
    super(`Execution with ID ${executionId} not found`);
  }
}

/**
 * Thrown when an invalid execution status transition is attempted
 */
export class InvalidExecutionStatusTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(`Cannot transition execution status from '${from}' to '${to}'`);
  }
}

/**
 * Thrown when a provider (Trakt, MDBList) is not configured
 */
export class ProviderNotConfiguredError extends DomainError {
  constructor(provider: string) {
    super(
      `${provider} provider is not configured. ` +
        `Please configure API keys in Settings → API Keys.`
    );
  }
}

/**
 * Thrown when Jellyseerr is not configured
 */
export class JellyseerrNotConfiguredError extends DomainError {
  constructor() {
    super('Jellyseerr is not configured. Please configure in Settings → Jellyseerr.');
  }
}

/**
 * Thrown when an invalid batch ID format is provided
 */
export class InvalidBatchIdError extends DomainError {
  constructor(value: string, reason: string) {
    super(`Invalid batch ID "${value}": ${reason}`);
  }
}
