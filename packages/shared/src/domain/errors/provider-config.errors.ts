import { DomainError } from './domain.error';

/**
 * Provider Configuration Domain Errors
 */

export class InvalidProviderTypeError extends DomainError {
  constructor(provider: string) {
    super(`Invalid provider type: ${provider}. Must be one of: trakt, mdblist, traktChart, stevenlu`);
  }
}

export class InvalidTraktClientIdError extends DomainError {
  constructor(reason: string) {
    super(`Invalid Trakt Client ID: ${reason}`);
  }
}

export class InvalidMdbListApiKeyError extends DomainError {
  constructor(reason: string) {
    super(`Invalid MDBList API Key: ${reason}`);
  }
}

export class ProviderConfigNotFoundError extends DomainError {
  constructor(userId: number, provider: string) {
    super(`Provider config not found for user ${userId} and provider ${provider}`);
  }
}

export class InvalidProviderConfigError extends DomainError {
  constructor(message: string) {
    super(message);
  }
}

export class EncryptionError extends DomainError {
  constructor(message: string) {
    super(`Encryption error: ${message}`);
  }
}
