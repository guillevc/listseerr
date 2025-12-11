import type { MediaType as MediaTypeType } from '../types/media-type.types';
import { MediaTypeValues } from '../types/media-type.types';
import { InvalidMediaTypeError } from '../errors/media-type.errors';

/**
 * MediaType Value Object
 *
 * Validates and encapsulates media type.
 * Represents the type of media content (movie or TV show).
 *
 * Features:
 * - Validation with descriptive error
 * - Type guard helpers (isMovie, isTv)
 * - Equality comparison
 * - Static factory methods for common types
 */
export class MediaType {
  private constructor(private readonly value: MediaTypeType) {}

  // Static factory method - validates before construction
  static create(value: string): MediaType {
    const normalized = value.toLowerCase();
    if (!this.isValid(normalized)) {
      throw new InvalidMediaTypeError(value);
    }
    return new MediaType(normalized as MediaTypeType);
  }

  // Validation method - reusable validation logic
  static isValid(value: string): boolean {
    return Object.values(MediaTypeValues).includes(value as MediaTypeType);
  }

  // Convenience factory methods
  static movie(): MediaType {
    return new MediaType(MediaTypeValues.MOVIE);
  }

  static tv(): MediaType {
    return new MediaType(MediaTypeValues.TV);
  }

  // Accessor method - unwraps primitive for serialization
  getValue(): MediaTypeType {
    return this.value;
  }

  // Type guard helpers
  isMovie(): boolean {
    return this.value === MediaTypeValues.MOVIE;
  }

  isTv(): boolean {
    return this.value === MediaTypeValues.TV;
  }

  // Equality comparison
  equals(other: MediaType): boolean {
    return this.value === other.value;
  }
}
