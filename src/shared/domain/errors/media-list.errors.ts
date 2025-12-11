import { DomainError } from './domain.error';

/**
 * Media List Domain Errors
 */

export class InvalidListNameError extends DomainError {
  constructor() {
    super('List name cannot be empty');
  }
}

export class InvalidListUrlError extends DomainError {
  constructor(url: string) {
    super(`Invalid list URL: ${url}`);
  }
}

export class MediaListNotFoundError extends DomainError {
  constructor(listId: number) {
    super(`Media list not found: ${listId}`);
  }
}
