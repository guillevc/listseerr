/**
 * Trakt Chart Type Value Object
 *
 * Server-only VO that handles Trakt chart type values.
 * Delegates validation logic to shared logic functions (DRY).
 */

import { InvalidTraktChartTypeError } from 'shared/domain/errors';
import { TraktChartTypeValues, type TraktChartType } from 'shared/domain/types';
import * as traktChartTypeLogic from 'shared/domain/logic';

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
    if (!traktChartTypeLogic.isValidTraktChartType(value)) {
      throw new InvalidTraktChartTypeError(value);
    }
    return new TraktChartTypeVO(traktChartTypeLogic.normalizeTraktChartType(value));
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
