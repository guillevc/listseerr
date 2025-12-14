import { InvalidTraktMediaTypeError } from '../errors/trakt-media-type.errors';

const Values = {
  MOVIES: 'movies',
  SHOWS: 'shows',
} as const;

export type TraktMediaType = (typeof Values)[keyof typeof Values];

export class TraktMediaTypeVO {
  private constructor(private readonly value: TraktMediaType) {}

  static create(value: string): TraktMediaTypeVO {
    const normalized = value.toLowerCase();
    if (!this.isValid(normalized)) {
      throw new InvalidTraktMediaTypeError(value);
    }
    return new TraktMediaTypeVO(normalized as TraktMediaType);
  }

  static isValid(value: string): boolean {
    return Object.values(Values).includes(value as TraktMediaType);
  }

  static movies(): TraktMediaTypeVO {
    return new TraktMediaTypeVO(Values.MOVIES);
  }

  static shows(): TraktMediaTypeVO {
    return new TraktMediaTypeVO(Values.SHOWS);
  }

  getValue(): TraktMediaType {
    return this.value;
  }

  isMovies(): boolean {
    return this.value === Values.MOVIES;
  }

  isShows(): boolean {
    return this.value === Values.SHOWS;
  }

  equals(other: TraktMediaTypeVO): boolean {
    return this.value === other.value;
  }
}
