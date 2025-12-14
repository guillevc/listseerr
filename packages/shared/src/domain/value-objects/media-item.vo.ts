import { MediaTypeVO } from './media-type.vo';
import type { MediaItemDTO } from '../../application/dtos/core/media-item.dto';

export interface MediaItemVOProps {
  title: string;
  year: number | null;
  tmdbId: number;
  mediaType: MediaTypeVO;
}

/**
 * MediaItemVO Value Object
 *
 * Represents a media item (movie or TV show) to be requested.
 * Immutable and identified by TMDB ID.
 *
 * Value Object (not Entity) because:
 * - Items are identified by tmdbId (external identifier)
 * - No lifecycle or mutable state
 * - Equality is based on tmdbId, not identity
 */
export class MediaItemVO {
  private constructor(
    private readonly _title: string,
    private readonly _year: number | null,
    private readonly _tmdbId: number,
    private readonly _mediaType: MediaTypeVO
  ) {}

  static create(props: MediaItemVOProps): MediaItemVO {
    // Validation
    if (!props.title || props.title.trim() === '') {
      throw new Error('Media item title cannot be empty');
    }

    if (!Number.isInteger(props.tmdbId) || props.tmdbId <= 0) {
      throw new Error(`Invalid TMDB ID: ${props.tmdbId}. Must be a positive integer.`);
    }

    if (
      props.year !== null &&
      (!Number.isInteger(props.year) || props.year < 1800 || props.year > 2100)
    ) {
      throw new Error(`Invalid year: ${props.year}. Must be between 1800 and 2100.`);
    }

    return new MediaItemVO(props.title.trim(), props.year, props.tmdbId, props.mediaType);
  }

  get title(): string {
    return this._title;
  }

  get year(): number | null {
    return this._year;
  }

  get tmdbId(): number {
    return this._tmdbId;
  }

  get mediaType(): MediaTypeVO {
    return this._mediaType;
  }

  /**
   * Value objects are equal if their tmdbId matches
   * (since TMDB ID uniquely identifies a media item)
   */
  equals(other: MediaItemVO): boolean {
    return this._tmdbId === other._tmdbId;
  }

  /**
   * Convert to DTO for crossing application boundary
   */
  toDTO(): MediaItemDTO {
    return {
      title: this._title,
      year: this._year,
      tmdbId: this._tmdbId,
      mediaType: this._mediaType.getValue(),
    };
  }
}
