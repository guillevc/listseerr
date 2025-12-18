/**
 * Trakt Media Type Value Object
 *
 * Server-only VO that handles Trakt media type values (movies/shows).
 */

import { InvalidTraktMediaTypeError } from 'shared/domain/errors/trakt-media-type.errors';
import { TraktMediaTypeValues, type TraktMediaType } from 'shared/domain/types/trakt.types';

export { TraktMediaTypeValues, type TraktMediaType };

export class TraktMediaTypeVO {
  private constructor(private readonly value: TraktMediaType) {}

  /**
   * Creates a VO from schema-validated data.
   */
  static create(value: TraktMediaType): TraktMediaTypeVO {
    return new TraktMediaTypeVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   */
  static fromPersistence(value: string): TraktMediaTypeVO {
    const normalized = value.toLowerCase();
    if (!Object.values(TraktMediaTypeValues).includes(normalized as TraktMediaType)) {
      throw new InvalidTraktMediaTypeError(value);
    }
    return new TraktMediaTypeVO(normalized as TraktMediaType);
  }

  // Factory methods
  static movies(): TraktMediaTypeVO {
    return new TraktMediaTypeVO(TraktMediaTypeValues.MOVIES);
  }

  static shows(): TraktMediaTypeVO {
    return new TraktMediaTypeVO(TraktMediaTypeValues.SHOWS);
  }

  getValue(): TraktMediaType {
    return this.value;
  }

  isMovies(): boolean {
    return this.value === TraktMediaTypeValues.MOVIES;
  }

  isShows(): boolean {
    return this.value === TraktMediaTypeValues.SHOWS;
  }

  equals(other: TraktMediaTypeVO): boolean {
    return this.value === other.value;
  }
}
