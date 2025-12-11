import type { TraktMediaType as TraktMediaTypeType } from '../types/trakt-media-type.types';
import { TraktMediaTypeValues } from '../types/trakt-media-type.types';
import { InvalidTraktMediaTypeError } from '../errors/trakt-media-type.errors';

/**
 * TraktMediaType Value Object
 *
 * Validates and encapsulates Trakt media type.
 * Represents the type of media in Trakt (movies or shows - plural form).
 *
 * Note: Different from MediaType VO which uses singular form ('movie'/'tv')
 *
 * Features:
 * - Validation with descriptive error
 * - Type guard helpers (isMovies, isShows)
 * - Equality comparison
 */
export class TraktMediaType {
  private constructor(private readonly value: TraktMediaTypeType) {}

  // Static factory method - validates before construction
  static create(value: string): TraktMediaType {
    const normalized = value.toLowerCase();
    if (!this.isValid(normalized)) {
      throw new InvalidTraktMediaTypeError(value);
    }
    return new TraktMediaType(normalized as TraktMediaTypeType);
  }

  // Validation method - reusable validation logic
  static isValid(value: string): boolean {
    return Object.values(TraktMediaTypeValues).includes(value as TraktMediaTypeType);
  }

  // Convenience factory methods
  static movies(): TraktMediaType {
    return new TraktMediaType(TraktMediaTypeValues.MOVIES);
  }

  static shows(): TraktMediaType {
    return new TraktMediaType(TraktMediaTypeValues.SHOWS);
  }

  // Accessor method - unwraps primitive for serialization
  getValue(): TraktMediaTypeType {
    return this.value;
  }

  // Type guard helpers
  isMovies(): boolean {
    return this.value === TraktMediaTypeValues.MOVIES;
  }

  isShows(): boolean {
    return this.value === TraktMediaTypeValues.SHOWS;
  }

  // Equality comparison
  equals(other: TraktMediaType): boolean {
    return this.value === other.value;
  }
}
