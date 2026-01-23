/**
 * AniList Domain Logic
 *
 * Pure functions for AniList status validation and display.
 */

import {
  AnilistStatusValues,
  AnilistStatusDisplayNames,
  type AnilistStatus,
} from '../types/anilist.types';

/**
 * Get all valid AniList status values.
 */
export function getAnilistStatusValues(): readonly AnilistStatus[] {
  return Object.values(AnilistStatusValues);
}

/**
 * Check if a value is a valid AniList status.
 */
export function isValidAnilistStatus(value: unknown): value is AnilistStatus {
  return (
    typeof value === 'string' && Object.values(AnilistStatusValues).includes(value as AnilistStatus)
  );
}

/**
 * Get the display name for an AniList status.
 */
export function getAnilistStatusDisplayName(status: AnilistStatus): string {
  return AnilistStatusDisplayNames[status];
}
