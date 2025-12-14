import { DomainError } from './domain.error';

export class MdbListConfigNotFoundError extends DomainError {
  constructor(userId: number) {
    super(`MdbList config not found for user ${userId}`);
  }
}
