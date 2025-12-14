import { InvalidTraktChartTypeError } from '../errors/trakt-chart-type.errors';

const Values = {
  TRENDING: 'trending',
  POPULAR: 'popular',
  FAVORITED: 'favorited',
  PLAYED: 'played',
  WATCHED: 'watched',
  COLLECTED: 'collected',
  ANTICIPATED: 'anticipated',
} as const;

export type TraktChartType = (typeof Values)[keyof typeof Values];

export class TraktChartTypeVO {
  private constructor(private readonly value: TraktChartType) {}

  static create(value: string): TraktChartTypeVO {
    const normalized = value.toLowerCase();
    if (!this.isValid(normalized)) {
      throw new InvalidTraktChartTypeError(value);
    }
    return new TraktChartTypeVO(normalized as TraktChartType);
  }

  static isValid(value: string): boolean {
    return Object.values(Values).includes(value as TraktChartType);
  }

  getValue(): TraktChartType {
    return this.value;
  }

  isTrending(): boolean {
    return this.value === Values.TRENDING;
  }

  isPopular(): boolean {
    return this.value === Values.POPULAR;
  }

  isFavorited(): boolean {
    return this.value === Values.FAVORITED;
  }

  isPlayed(): boolean {
    return this.value === Values.PLAYED;
  }

  isWatched(): boolean {
    return this.value === Values.WATCHED;
  }

  isCollected(): boolean {
    return this.value === Values.COLLECTED;
  }

  isAnticipated(): boolean {
    return this.value === Values.ANTICIPATED;
  }

  isWrappedChartType(): boolean {
    return (
      this.value === Values.TRENDING ||
      this.value === Values.ANTICIPATED ||
      this.value === Values.COLLECTED ||
      this.value === Values.PLAYED ||
      this.value === Values.WATCHED ||
      this.value === Values.FAVORITED
    );
  }

  equals(other: TraktChartTypeVO): boolean {
    return this.value === other.value;
  }
}
