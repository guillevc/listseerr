/**
 * Media Type Logic Functions
 *
 * Pure functions for media type validation and detection.
 * Shared between frontend and server VOs (DRY principle).
 */

import { MediaTypeValues, type MediaType } from '../types/media.types';

/**
 * Checks if a value is a valid media type.
 * Normalizes to lowercase for case-insensitive matching.
 */
export function isValidMediaType(value: string): value is MediaType {
  const normalized = value.toLowerCase();
  return Object.values(MediaTypeValues).includes(normalized as MediaType);
}

/**
 * Normalizes a media type string to the canonical lowercase form.
 * Returns the normalized value if valid, throws if invalid.
 */
export function normalizeMediaType(value: string): MediaType {
  const normalized = value.toLowerCase();
  if (!Object.values(MediaTypeValues).includes(normalized as MediaType)) {
    throw new Error(`Invalid media type: ${value}`);
  }
  return normalized as MediaType;
}

// Type guard functions
export function isMovie(mediaType: MediaType): boolean {
  return mediaType === MediaTypeValues.MOVIE;
}

export function isTv(mediaType: MediaType): boolean {
  return mediaType === MediaTypeValues.TV;
}
