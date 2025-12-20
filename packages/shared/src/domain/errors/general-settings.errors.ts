import { DomainError } from './domain.error';

/**
 * General Settings Domain Errors
 */

export class GeneralSettingsNotFoundError extends DomainError {
  constructor(userId: number) {
    super(`General settings not found for user ${userId}`);
  }
}
