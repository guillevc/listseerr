import { DomainError } from './domain.error';

export class TraktConfigNotFoundError extends DomainError {
  readonly code = 'TRAKT_CONFIG_NOT_FOUND_ERROR' as const;

  constructor(userId: number) {
    super(`Trakt config not found for user ${userId}`);
  }
}
