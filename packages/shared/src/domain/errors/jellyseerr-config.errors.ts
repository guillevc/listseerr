import { DomainError } from './domain.error';

/**
 * Jellyseerr Configuration Domain Errors
 */

export class InvalidJellyseerrUrlError extends DomainError {
  readonly code = 'INVALID_JELLYSEERR_URL_ERROR' as const;

  constructor(url: string, reason?: string) {
    super(reason ? `Invalid Jellyseerr URL: ${url}. ${reason}` : `Invalid Jellyseerr URL: ${url}`);
  }
}

export class InvalidJellyseerrApiKeyError extends DomainError {
  readonly code = 'INVALID_JELLYSEERR_API_KEY_ERROR' as const;

  constructor(reason: string = 'API key cannot be empty') {
    super(`Invalid Jellyseerr API key: ${reason}`);
  }
}

export class InvalidJellyseerrUserIdError extends DomainError {
  readonly code = 'INVALID_JELLYSEERR_USER_ID_ERROR' as const;

  constructor(userId: number) {
    super(`Invalid Jellyseerr user ID: ${userId}. Must be a positive integer.`);
  }
}

export class JellyseerrConfigNotFoundError extends DomainError {
  readonly code = 'JELLYSEERR_CONFIG_NOT_FOUND_ERROR' as const;

  constructor(userId: number) {
    super(`Jellyseerr configuration not found for user ${userId}`);
  }
}
