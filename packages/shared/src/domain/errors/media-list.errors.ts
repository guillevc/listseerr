import { DomainError } from './domain.error';

/**
 * Media List Domain Errors
 */

export class InvalidListNameError extends DomainError {
  readonly code = 'INVALID_LIST_NAME_ERROR' as const;

  constructor() {
    super('List name cannot be empty');
  }
}

export class InvalidListUrlError extends DomainError {
  readonly code = 'INVALID_LIST_URL_ERROR' as const;

  constructor(url: string) {
    super(`Invalid list URL: ${url}`);
  }
}

export class MediaListNotFoundError extends DomainError {
  readonly code = 'MEDIA_LIST_NOT_FOUND_ERROR' as const;

  constructor(listId: number) {
    super(`Media list not found: ${listId}`);
  }
}

export class InvalidMaxItemsError extends DomainError {
  readonly code = 'INVALID_MAX_ITEMS_ERROR' as const;

  constructor(value: number) {
    super(`Invalid max items: ${value}. Must be between 1 and 50.`);
  }
}
