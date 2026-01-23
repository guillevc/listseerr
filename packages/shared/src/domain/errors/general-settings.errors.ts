import { DomainError } from './domain.error';

/**
 * General Settings Domain Errors
 */

export class GeneralSettingsNotFoundError extends DomainError {
  readonly code = 'GENERAL_SETTINGS_NOT_FOUND_ERROR' as const;

  constructor(userId: number) {
    super(`General settings not found for user ${userId}`);
  }
}
