import { DomainError } from './domain.error';

export class MdbListConfigNotFoundError extends DomainError {
  readonly code = 'MDB_LIST_CONFIG_NOT_FOUND_ERROR' as const;

  constructor(userId: number) {
    super(`MdbList config not found for user ${userId}`);
  }
}
