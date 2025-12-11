/**
 * Media Type Values
 *
 * Runtime constants for media type identification.
 * Provides named constants for all supported media types.
 *
 * Usage:
 * - Use constants instead of magic strings: `MediaTypeValues.MOVIE` instead of `'movie'`
 * - Enables IDE autocomplete for media type values
 * - Single source of truth for all media type identifiers
 */
export const MediaTypeValues = {
  MOVIE: 'movie',
  TV: 'tv',
} as const;

/**
 * Media Type
 *
 * Union type derived from MediaTypeValues.
 * Automatically stays in sync with runtime values.
 * Shared between server and client for validation and type safety.
 *
 * Type is inferred as: 'movie' | 'tv'
 *
 * Used by:
 * - MediaType Value Object
 * - MediaItemDTO
 * - All media-related domain logic
 */
export type MediaType = typeof MediaTypeValues[keyof typeof MediaTypeValues];
