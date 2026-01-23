import { DomainError } from './domain.error';

/**
 * Thrown when an invalid media item is provided
 */
export class InvalidMediaItemError extends DomainError {
  readonly code = 'INVALID_MEDIA_ITEM_ERROR' as const;

  constructor(reason: string) {
    super(`Invalid media item: ${reason}`);
  }
}
