/**
 * AniList Domain Types
 *
 * Domain-level types and constants for AniList integration.
 * These represent the core business concepts independent of any schema library.
 */

/**
 * AniList status values for anime lists.
 * Maps to AniList GraphQL MediaListStatus enum.
 */
export const AnilistStatusValues = {
  CURRENT: 'CURRENT',
  PLANNING: 'PLANNING',
  COMPLETED: 'COMPLETED',
  DROPPED: 'DROPPED',
  PAUSED: 'PAUSED',
  REPEATING: 'REPEATING',
} as const;

export type AnilistStatus = (typeof AnilistStatusValues)[keyof typeof AnilistStatusValues];

/**
 * Human-readable display names for AniList status values.
 */
export const AnilistStatusDisplayNames: Record<AnilistStatus, string> = {
  [AnilistStatusValues.CURRENT]: 'Currently Watching',
  [AnilistStatusValues.PLANNING]: 'Plan to Watch',
  [AnilistStatusValues.COMPLETED]: 'Completed',
  [AnilistStatusValues.DROPPED]: 'Dropped',
  [AnilistStatusValues.PAUSED]: 'On Hold',
  [AnilistStatusValues.REPEATING]: 'Rewatching',
};
