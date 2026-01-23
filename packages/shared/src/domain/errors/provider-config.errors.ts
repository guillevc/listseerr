import { DomainError } from './domain.error';
import { InvalidProviderError } from './provider.errors';

/**
 * Provider Configuration Domain Errors
 */

/**
 * @deprecated Use InvalidProviderError from provider.errors instead.
 * This is kept for backward compatibility.
 */
export const InvalidProviderTypeError = InvalidProviderError;

export class InvalidTraktClientIdError extends DomainError {
  readonly code = 'INVALID_TRAKT_CLIENT_ID_ERROR' as const;

  constructor(reason: string) {
    super(`Invalid Trakt Client ID: ${reason}`);
  }
}

export class InvalidMdbListApiKeyError extends DomainError {
  readonly code = 'INVALID_MDB_LIST_API_KEY_ERROR' as const;

  constructor(reason: string) {
    super(`Invalid MDBList API Key: ${reason}`);
  }
}

export class ProviderConfigNotFoundError extends DomainError {
  readonly code = 'PROVIDER_CONFIG_NOT_FOUND_ERROR' as const;

  constructor(userId: number, provider: string) {
    super(`Provider config not found for user ${userId} and provider ${provider}`);
  }
}

export class InvalidProviderConfigError extends DomainError {
  readonly code = 'INVALID_PROVIDER_CONFIG_ERROR' as const;

  constructor(message: string) {
    super(message);
  }
}

export class EncryptionError extends DomainError {
  readonly code = 'ENCRYPTION_ERROR' as const;

  constructor(message: string) {
    super(`Encryption error: ${message}`);
  }
}
