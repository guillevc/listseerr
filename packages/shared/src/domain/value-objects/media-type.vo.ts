import { InvalidMediaTypeError } from '../errors/media-type.errors';

const Values = {
  MOVIE: 'movie',
  TV: 'tv',
} as const;

export type MediaType = (typeof Values)[keyof typeof Values];

export class MediaTypeVO {
  private constructor(private readonly value: MediaType) {}

  static create(value: string): MediaTypeVO {
    const normalized = value.toLowerCase();
    if (!this.isValid(normalized)) {
      throw new InvalidMediaTypeError(value);
    }
    return new MediaTypeVO(normalized as MediaType);
  }

  static isValid(value: string): boolean {
    return Object.values(Values).includes(value as MediaType);
  }

  static movie(): MediaTypeVO {
    return new MediaTypeVO(Values.MOVIE);
  }

  static tv(): MediaTypeVO {
    return new MediaTypeVO(Values.TV);
  }

  getValue(): MediaType {
    return this.value;
  }

  isMovie(): boolean {
    return this.value === Values.MOVIE;
  }

  isTv(): boolean {
    return this.value === Values.TV;
  }

  equals(other: MediaTypeVO): boolean {
    return this.value === other.value;
  }
}
