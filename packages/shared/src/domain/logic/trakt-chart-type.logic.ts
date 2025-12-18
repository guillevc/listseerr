/**
 * Trakt Chart Type Logic Functions
 *
 * Pure functions for Trakt chart type validation and detection.
 * Shared between frontend and server VOs (DRY principle).
 */

import { TraktChartTypeValues, type TraktChartType } from '../types/trakt.types';

/**
 * Display names for Trakt chart types.
 * Used in UI dropdowns and labels.
 */
export const TraktChartDisplayNames: Record<TraktChartType, string> = {
  trending: 'Trending',
  popular: 'Popular',
  favorited: 'Most Favorited',
  played: 'Most Played',
  watched: 'Most Watched',
  collected: 'Most Collected',
  anticipated: 'Most Anticipated',
};

/**
 * Gets the display name for a Trakt chart type.
 */
export function getTraktChartDisplayName(chartType: TraktChartType): string {
  return TraktChartDisplayNames[chartType];
}

/**
 * Checks if a value is a valid Trakt chart type.
 * Normalizes to lowercase for case-insensitive matching.
 */
export function isValidTraktChartType(value: string): value is TraktChartType {
  const normalized = value.toLowerCase();
  return Object.values(TraktChartTypeValues).includes(normalized as TraktChartType);
}

/**
 * Normalizes a Trakt chart type string to the canonical lowercase form.
 * Returns the normalized value if valid, throws if invalid.
 */
export function normalizeTraktChartType(value: string): TraktChartType {
  const normalized = value.toLowerCase();
  if (!Object.values(TraktChartTypeValues).includes(normalized as TraktChartType)) {
    throw new Error(`Invalid Trakt chart type: ${value}`);
  }
  return normalized as TraktChartType;
}

// Type guard functions
export function isTrending(chartType: TraktChartType): boolean {
  return chartType === TraktChartTypeValues.TRENDING;
}

export function isPopular(chartType: TraktChartType): boolean {
  return chartType === TraktChartTypeValues.POPULAR;
}

export function isFavorited(chartType: TraktChartType): boolean {
  return chartType === TraktChartTypeValues.FAVORITED;
}

export function isPlayed(chartType: TraktChartType): boolean {
  return chartType === TraktChartTypeValues.PLAYED;
}

export function isWatched(chartType: TraktChartType): boolean {
  return chartType === TraktChartTypeValues.WATCHED;
}

export function isCollected(chartType: TraktChartType): boolean {
  return chartType === TraktChartTypeValues.COLLECTED;
}

export function isAnticipated(chartType: TraktChartType): boolean {
  return chartType === TraktChartTypeValues.ANTICIPATED;
}

/**
 * Checks if a chart type is a "wrapped" chart type.
 * Wrapped chart types return data wrapped in an object with the item under a key.
 */
export function isWrappedChartType(chartType: TraktChartType): boolean {
  return (
    chartType === TraktChartTypeValues.TRENDING ||
    chartType === TraktChartTypeValues.ANTICIPATED ||
    chartType === TraktChartTypeValues.COLLECTED ||
    chartType === TraktChartTypeValues.PLAYED ||
    chartType === TraktChartTypeValues.WATCHED ||
    chartType === TraktChartTypeValues.FAVORITED
  );
}
