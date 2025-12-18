/**
 * Media Type Value Object
 *
 * Server-only VO that handles media type values (movie/tv).
 * Delegates validation logic to shared logic functions (DRY).
 */

import { InvalidMediaTypeError } from 'shared/domain/errors/media-type.errors';
import { MediaTypeValues, type MediaType } from 'shared/domain/types/media.types';
import * as mediaTypeLogic from 'shared/domain/logic/media-type.logic';

export { MediaTypeValues, type MediaType };

export class MediaTypeVO {
  private constructor(private readonly value: MediaType) {}

  /**
   * Creates a VO from schema-validated data.
   */
  static create(value: MediaType): MediaTypeVO {
    return new MediaTypeVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   */
  static fromPersistence(value: string): MediaTypeVO {
    if (!mediaTypeLogic.isValidMediaType(value)) {
      throw new InvalidMediaTypeError(value);
    }
    return new MediaTypeVO(mediaTypeLogic.normalizeMediaType(value));
  }

  // Factory methods for convenience
  static movie(): MediaTypeVO {
    return new MediaTypeVO(MediaTypeValues.MOVIE);
  }

  static tv(): MediaTypeVO {
    return new MediaTypeVO(MediaTypeValues.TV);
  }

  getValue(): MediaType {
    return this.value;
  }

  isMovie(): boolean {
    return this.value === MediaTypeValues.MOVIE;
  }

  isTv(): boolean {
    return this.value === MediaTypeValues.TV;
  }

  equals(other: MediaTypeVO): boolean {
    return this.value === other.value;
  }
}
