/**
 * Trakt Chart Type Values
 *
 * Runtime constants for Trakt chart type identification.
 * Provides named constants for all supported Trakt chart types.
 *
 * Usage:
 * - Use constants instead of magic strings: `TraktChartTypeValues.TRENDING` instead of `'trending'`
 * - Enables IDE autocomplete for chart type values
 * - Single source of truth for all Trakt chart type identifiers
 */
export const TraktChartTypeValues = {
  TRENDING: 'trending',
  POPULAR: 'popular',
  FAVORITED: 'favorited',
  PLAYED: 'played',
  WATCHED: 'watched',
  COLLECTED: 'collected',
  ANTICIPATED: 'anticipated',
} as const;

/**
 * Trakt Chart Type
 *
 * Union type derived from TraktChartTypeValues.
 * Automatically stays in sync with runtime values.
 * Shared between server and client for validation and type safety.
 *
 * Type is inferred as: 'trending' | 'popular' | 'favorited' | 'played' | 'watched' | 'collected' | 'anticipated'
 *
 * Used by:
 * - TraktChartType Value Object
 * - Trakt chart client
 * - All Trakt chart-related domain logic
 */
export type TraktChartType = typeof TraktChartTypeValues[keyof typeof TraktChartTypeValues];
