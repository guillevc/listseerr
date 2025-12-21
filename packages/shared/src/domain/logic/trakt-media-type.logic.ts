/**
 * Trakt Media Type Logic Functions
 *
 * Pure functions for Trakt media type validation and detection.
 * Shared between frontend and server VOs (DRY principle).
 */

import { TraktMediaTypeValues } from '../types/trakt.types';
import {
  createCaseInsensitiveEnumValidator,
  createEnumNormalizer,
  createEnumGuard,
} from './enum-utils.logic';

/**
 * Checks if a value is a valid Trakt media type.
 * Normalizes to lowercase for case-insensitive matching.
 */
export const isValidTraktMediaType = createCaseInsensitiveEnumValidator(TraktMediaTypeValues);

/**
 * Normalizes a Trakt media type string to the canonical lowercase form.
 * Returns the normalized value if valid, throws if invalid.
 */
export const normalizeTraktMediaType = createEnumNormalizer(
  TraktMediaTypeValues,
  'Trakt media type'
);

// Type guard functions
export const isMovies = createEnumGuard(TraktMediaTypeValues.MOVIES);
export const isShows = createEnumGuard(TraktMediaTypeValues.SHOWS);
