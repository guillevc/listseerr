/**
 * Trakt Chart Type Logic Functions
 *
 * Pure functions for Trakt chart type validation and detection.
 * Shared between frontend and server VOs (DRY principle).
 */

import { TraktChartTypeValues, type TraktChartType } from '../types/trakt.types';
import {
  createCaseInsensitiveEnumValidator,
  createEnumNormalizer,
  createEnumGuard,
  createDisplayNameGetter,
} from './enum-utils.logic';

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
export const getTraktChartDisplayName = createDisplayNameGetter(TraktChartDisplayNames);

/**
 * Checks if a value is a valid Trakt chart type.
 * Normalizes to lowercase for case-insensitive matching.
 */
export const isValidTraktChartType = createCaseInsensitiveEnumValidator(TraktChartTypeValues);

/**
 * Normalizes a Trakt chart type string to the canonical lowercase form.
 * Returns the normalized value if valid, throws if invalid.
 */
export const normalizeTraktChartType = createEnumNormalizer(
  TraktChartTypeValues,
  'Trakt chart type'
);

// Type guard functions
export const isTrending = createEnumGuard(TraktChartTypeValues.TRENDING);
export const isPopular = createEnumGuard(TraktChartTypeValues.POPULAR);
export const isFavorited = createEnumGuard(TraktChartTypeValues.FAVORITED);
export const isPlayed = createEnumGuard(TraktChartTypeValues.PLAYED);
export const isWatched = createEnumGuard(TraktChartTypeValues.WATCHED);
export const isCollected = createEnumGuard(TraktChartTypeValues.COLLECTED);
export const isAnticipated = createEnumGuard(TraktChartTypeValues.ANTICIPATED);

/**
 * Chart types that return wrapped responses from Trakt API.
 * These return data in a wrapper object with the item under a key.
 * Note: 'popular' is NOT wrapped - it returns items directly.
 */
const WRAPPED_CHART_TYPES: ReadonlySet<TraktChartType> = new Set([
  TraktChartTypeValues.TRENDING,
  TraktChartTypeValues.FAVORITED,
  TraktChartTypeValues.PLAYED,
  TraktChartTypeValues.WATCHED,
  TraktChartTypeValues.COLLECTED,
  TraktChartTypeValues.ANTICIPATED,
]);

/**
 * Checks if a chart type is a "wrapped" chart type.
 * Wrapped chart types return data wrapped in an object with the item under a key.
 */
export function isWrappedChartType(chartType: TraktChartType): boolean {
  return WRAPPED_CHART_TYPES.has(chartType);
}
