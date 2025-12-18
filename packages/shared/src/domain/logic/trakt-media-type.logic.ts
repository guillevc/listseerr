/**
 * Trakt Media Type Logic Functions
 *
 * Pure functions for Trakt media type validation and detection.
 * Shared between frontend and server VOs (DRY principle).
 */

import { TraktMediaTypeValues, type TraktMediaType } from '../types/trakt.types';

/**
 * Checks if a value is a valid Trakt media type.
 * Normalizes to lowercase for case-insensitive matching.
 */
export function isValidTraktMediaType(value: string): value is TraktMediaType {
  const normalized = value.toLowerCase();
  return Object.values(TraktMediaTypeValues).includes(normalized as TraktMediaType);
}

/**
 * Normalizes a Trakt media type string to the canonical lowercase form.
 * Returns the normalized value if valid, throws if invalid.
 */
export function normalizeTraktMediaType(value: string): TraktMediaType {
  const normalized = value.toLowerCase();
  if (!Object.values(TraktMediaTypeValues).includes(normalized as TraktMediaType)) {
    throw new Error(`Invalid Trakt media type: ${value}`);
  }
  return normalized as TraktMediaType;
}

// Type guard functions
export function isMovies(mediaType: TraktMediaType): boolean {
  return mediaType === TraktMediaTypeValues.MOVIES;
}

export function isShows(mediaType: TraktMediaType): boolean {
  return mediaType === TraktMediaTypeValues.SHOWS;
}
