/**
 * Trakt Media Type Value Object
 *
 * Server-only VO that handles Trakt media type values (movies/shows).
 * Delegates validation logic to shared logic functions (DRY).
 */

import { InvalidTraktMediaTypeError } from 'shared/domain/errors';
import { TraktMediaTypeValues, type TraktMediaType } from 'shared/domain/types';
import * as traktMediaTypeLogic from 'shared/domain/logic';

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
    if (!traktMediaTypeLogic.isValidTraktMediaType(value)) {
      throw new InvalidTraktMediaTypeError(value);
    }
    return new TraktMediaTypeVO(traktMediaTypeLogic.normalizeTraktMediaType(value));
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
    return traktMediaTypeLogic.isMovies(this.value);
  }

  isShows(): boolean {
    return traktMediaTypeLogic.isShows(this.value);
  }

  equals(other: TraktMediaTypeVO): boolean {
    return this.value === other.value;
  }
}
