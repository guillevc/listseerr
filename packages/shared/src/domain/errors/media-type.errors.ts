import { DomainError } from './domain.error';
import { MediaTypeValues } from '../types/media.types';

const validMediaTypes = Object.values(MediaTypeValues).join(', ');

/**
 * Invalid Media Type Error
 *
 * Thrown when an invalid media type is provided.
 */
export class InvalidMediaTypeError extends DomainError {
  readonly code = 'INVALID_MEDIA_TYPE_ERROR' as const;

  constructor(mediaType: string) {
    super(`Invalid media type: ${mediaType}. Must be one of: ${validMediaTypes}`);
  }
}
