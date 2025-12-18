import { DomainError } from './domain.error';

/**
 * Thrown when an invalid media item is provided
 */
export class InvalidMediaItemError extends DomainError {
  constructor(reason: string) {
    super(`Invalid media item: ${reason}`);
  }
}
