import { DomainError } from './domain.error';

/**
 * Jellyseerr Configuration Domain Errors
 */

export class InvalidJellyseerrUrlError extends DomainError {
  constructor(url: string, reason?: string) {
    super(reason ? `Invalid Jellyseerr URL: ${url}. ${reason}` : `Invalid Jellyseerr URL: ${url}`);
  }
}

export class InvalidJellyseerrApiKeyError extends DomainError {
  constructor(reason: string = 'API key cannot be empty') {
    super(`Invalid Jellyseerr API key: ${reason}`);
  }
}

export class InvalidJellyseerrUserIdError extends DomainError {
  constructor(userId: number) {
    super(`Invalid Jellyseerr user ID: ${userId}. Must be a positive integer.`);
  }
}

export class JellyseerrConfigNotFoundError extends DomainError {
  constructor(userId: number) {
    super(`Jellyseerr configuration not found for user ${userId}`);
  }
}
