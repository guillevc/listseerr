import { DomainError } from './domain.error';

/**
 * Invalid Trakt Media Type Error
 *
 * Thrown when an invalid Trakt media type is provided.
 * Valid media types: movies, shows
 */
export class InvalidTraktMediaTypeError extends DomainError {
  readonly code = 'INVALID_TRAKT_MEDIA_TYPE_ERROR' as const;

  constructor(mediaType: string) {
    super(`Invalid Trakt media type: ${mediaType}. Must be one of: movies, shows`);
  }
}
