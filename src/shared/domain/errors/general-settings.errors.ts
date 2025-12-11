import { DomainError } from './domain.error';

/**
 * General Settings Domain Errors
 */

export class InvalidTimezoneError extends DomainError {
  constructor(timezone: string) {
    super(`Invalid timezone: ${timezone}`);
  }
}

export class GeneralSettingsNotFoundError extends DomainError {
  constructor(userId: number) {
    super(`General settings not found for user ${userId}`);
  }
}
