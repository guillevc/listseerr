/**
 * Media Type Logic Functions
 *
 * Pure functions for media type validation and detection.
 * Shared between frontend and server VOs (DRY principle).
 */

import { MediaTypeValues } from '../types/media.types';
import {
  createCaseInsensitiveEnumValidator,
  createEnumNormalizer,
  createEnumGuard,
} from './enum-utils.logic';

/**
 * Checks if a value is a valid media type.
 * Normalizes to lowercase for case-insensitive matching.
 */
export const isValidMediaType = createCaseInsensitiveEnumValidator(MediaTypeValues);

/**
 * Normalizes a media type string to the canonical lowercase form.
 * Returns the normalized value if valid, throws if invalid.
 */
export const normalizeMediaType = createEnumNormalizer(MediaTypeValues, 'media type');

// Type guard functions
export const isMovie = createEnumGuard(MediaTypeValues.MOVIE);
export const isTv = createEnumGuard(MediaTypeValues.TV);
