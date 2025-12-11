/**
 * Trakt Media Type Values
 *
 * Runtime constants for Trakt media type identification.
 * Provides named constants for all supported Trakt media types.
 *
 * Note: Different from MediaType ('movie'/'tv') - Trakt uses 'movies'/'shows' (plural)
 *
 * Usage:
 * - Use constants instead of magic strings: `TraktMediaTypeValues.MOVIES` instead of `'movies'`
 * - Enables IDE autocomplete for media type values
 * - Single source of truth for all Trakt media type identifiers
 */
export const TraktMediaTypeValues = {
  MOVIES: 'movies',
  SHOWS: 'shows',
} as const;

/**
 * Trakt Media Type
 *
 * Union type derived from TraktMediaTypeValues.
 * Automatically stays in sync with runtime values.
 * Shared between server and client for validation and type safety.
 *
 * Type is inferred as: 'movies' | 'shows'
 *
 * Used by:
 * - TraktMediaType Value Object
 * - Trakt chart client
 * - All Trakt-related domain logic
 */
export type TraktMediaType = typeof TraktMediaTypeValues[keyof typeof TraktMediaTypeValues];
