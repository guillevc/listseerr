/**
 * MediaType Value Object
 *
 * Represents the type of media content (movie or TV show).
 * Ensures type safety and prevents invalid media types.
 */
export class MediaType {
  private constructor(private readonly value: 'movie' | 'tv') {}

  static movie(): MediaType {
    return new MediaType('movie');
  }

  static tv(): MediaType {
    return new MediaType('tv');
  }

  static fromString(value: string): MediaType {
    const normalized = value.toLowerCase();

    if (normalized !== 'movie' && normalized !== 'tv') {
      throw new Error(`Invalid media type: ${value}. Must be 'movie' or 'tv'.`);
    }

    return new MediaType(normalized);
  }

  isMovie(): boolean {
    return this.value === 'movie';
  }

  isTv(): boolean {
    return this.value === 'tv';
  }

  getValue(): 'movie' | 'tv' {
    return this.value;
  }

  equals(other: MediaType): boolean {
    return this.value === other.value;
  }
}
