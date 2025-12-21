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
    return traktChartTypeLogic.isTrending(this.value);
  }

  isPopular(): boolean {
    return traktChartTypeLogic.isPopular(this.value);
  }

  isFavorited(): boolean {
    return traktChartTypeLogic.isFavorited(this.value);
  }

  isPlayed(): boolean {
    return traktChartTypeLogic.isPlayed(this.value);
  }

  isWatched(): boolean {
    return traktChartTypeLogic.isWatched(this.value);
  }

  isCollected(): boolean {
    return traktChartTypeLogic.isCollected(this.value);
  }

  isAnticipated(): boolean {
    return traktChartTypeLogic.isAnticipated(this.value);
  }

  isWrappedChartType(): boolean {
    return traktChartTypeLogic.isWrappedChartType(this.value);
  }

  equals(other: TraktChartTypeVO): boolean {
    return this.value === other.value;
  }
}
