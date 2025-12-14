import { DomainError } from './domain.error';

export class TraktConfigNotFoundError extends DomainError {
  constructor(userId: number) {
    super(`Trakt config not found for user ${userId}`);
  }
}
