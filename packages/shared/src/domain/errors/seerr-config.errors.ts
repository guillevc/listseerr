import { DomainError } from './domain.error';

/**
 * Seerr Configuration Domain Errors
 */

export class InvalidSeerrUrlError extends DomainError {
  readonly code = 'INVALID_SEERR_URL_ERROR' as const;

  constructor(url: string, reason?: string) {
    super(reason ? `Invalid Seerr URL: ${url}. ${reason}` : `Invalid Seerr URL: ${url}`);
  }
}

export class InvalidSeerrApiKeyError extends DomainError {
  readonly code = 'INVALID_SEERR_API_KEY_ERROR' as const;

  constructor(reason: string = 'API key cannot be empty') {
    super(`Invalid Seerr API key: ${reason}`);
  }
}

export class InvalidSeerrUserIdError extends DomainError {
  readonly code = 'INVALID_SEERR_USER_ID_ERROR' as const;

  constructor(userId: number) {
    super(`Invalid Seerr user ID: ${userId}. Must be a positive integer.`);
  }
}

export class SeerrConfigNotFoundError extends DomainError {
  readonly code = 'SEERR_CONFIG_NOT_FOUND_ERROR' as const;

  constructor(userId: number) {
    super(`Seerr configuration not found for user ${userId}`);
  }
}
