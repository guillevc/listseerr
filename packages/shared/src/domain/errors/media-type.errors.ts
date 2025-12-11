/**
 * Invalid Media Type Error
 *
 * Thrown when an invalid media type is provided.
 * Valid media types: movie, tv
 */
export class InvalidMediaTypeError extends Error {
  constructor(mediaType: string) {
    super(
      `Invalid media type: ${mediaType}. Must be one of: movie, tv`
    );
    this.name = 'InvalidMediaTypeError';
  }
}
