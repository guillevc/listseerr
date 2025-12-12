/**
 * Invalid Trakt Media Type Error
 *
 * Thrown when an invalid Trakt media type is provided.
 * Valid media types: movies, shows
 */
export class InvalidTraktMediaTypeError extends Error {
  constructor(mediaType: string) {
    super(`Invalid Trakt media type: ${mediaType}. Must be one of: movies, shows`);
    this.name = 'InvalidTraktMediaTypeError';
  }
}
