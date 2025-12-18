/**
 * Trakt Chart Type Value Object
 *
 * Server-only VO that handles Trakt chart type values.
 */

import { InvalidTraktChartTypeError } from 'shared/domain/errors/trakt-chart-type.errors';
import { TraktChartTypeValues, type TraktChartType } from 'shared/domain/types/trakt.types';

export { TraktChartTypeValues, type TraktChartType };

export class TraktChartTypeVO {
  private constructor(private readonly value: TraktChartType) {}

  /**
   * Creates a VO from schema-validated data.
   */
  static create(value: TraktChartType): TraktChartTypeVO {
    return new TraktChartTypeVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   */
  static fromPersistence(value: string): TraktChartTypeVO {
    const normalized = value.toLowerCase();
    if (!Object.values(TraktChartTypeValues).includes(normalized as TraktChartType)) {
      throw new InvalidTraktChartTypeError(value);
    }
    return new TraktChartTypeVO(normalized as TraktChartType);
  }

  getValue(): TraktChartType {
    return this.value;
  }

  isTrending(): boolean {
    return this.value === TraktChartTypeValues.TRENDING;
  }

  isPopular(): boolean {
    return this.value === TraktChartTypeValues.POPULAR;
  }

  isFavorited(): boolean {
    return this.value === TraktChartTypeValues.FAVORITED;
  }

  isPlayed(): boolean {
    return this.value === TraktChartTypeValues.PLAYED;
  }

  isWatched(): boolean {
    return this.value === TraktChartTypeValues.WATCHED;
  }

  isCollected(): boolean {
    return this.value === TraktChartTypeValues.COLLECTED;
  }

  isAnticipated(): boolean {
    return this.value === TraktChartTypeValues.ANTICIPATED;
  }

  isWrappedChartType(): boolean {
    return (
      this.value === TraktChartTypeValues.TRENDING ||
      this.value === TraktChartTypeValues.ANTICIPATED ||
      this.value === TraktChartTypeValues.COLLECTED ||
      this.value === TraktChartTypeValues.PLAYED ||
      this.value === TraktChartTypeValues.WATCHED ||
      this.value === TraktChartTypeValues.FAVORITED
    );
  }

  equals(other: TraktChartTypeVO): boolean {
    return this.value === other.value;
  }
}
