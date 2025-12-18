/**
 * Media Item Value Object
 *
 * Server-only VO representing a media item (movie or TV show).
 * Identified by TMDB ID.
 */

import { MediaTypeVO } from './media-type.vo';

export interface MediaItemVOProps {
  title: string;
  year: number | null;
  tmdbId: number;
  mediaType: MediaTypeVO;
}

export class MediaItemVO {
  private constructor(
    private readonly _title: string,
    private readonly _year: number | null,
    private readonly _tmdbId: number,
    private readonly _mediaType: MediaTypeVO
  ) {}

  /**
   * Creates a VO with validation.
   */
  static create(props: MediaItemVOProps): MediaItemVO {
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

  equals(other: MediaItemVO): boolean {
    return this._tmdbId === other._tmdbId;
  }
}
