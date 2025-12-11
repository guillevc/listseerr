import type { TraktChartType as TraktChartTypeType } from '../types/trakt-chart-type.types';
import { TraktChartTypeValues } from '../types/trakt-chart-type.types';
import { InvalidTraktChartTypeError } from '../errors/trakt-chart-type.errors';

/**
 * TraktChartType Value Object
 *
 * Validates and encapsulates Trakt chart type.
 * Represents the type of Trakt chart (trending, popular, etc.).
 *
 * Features:
 * - Validation with descriptive error
 * - Type guard helpers for each chart type
 * - Equality comparison
 * - Wrapped chart type detection
 */
export class TraktChartType {
  private constructor(private readonly value: TraktChartTypeType) {}

  // Static factory method - validates before construction
  static create(value: string): TraktChartType {
    const normalized = value.toLowerCase();
    if (!this.isValid(normalized)) {
      throw new InvalidTraktChartTypeError(value);
    }
    return new TraktChartType(normalized as TraktChartTypeType);
  }

  // Validation method - reusable validation logic
  static isValid(value: string): boolean {
    return Object.values(TraktChartTypeValues).includes(value as TraktChartTypeType);
  }

  // Accessor method - unwraps primitive for serialization
  getValue(): TraktChartTypeType {
    return this.value;
  }

  // Type guard helpers
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

  // Domain logic - chart types that return wrapped responses
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

  // Equality comparison
  equals(other: TraktChartType): boolean {
    return this.value === other.value;
  }
}
