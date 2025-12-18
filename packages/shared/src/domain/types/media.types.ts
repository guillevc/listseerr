/**
 * Media Types
 *
 * Pure TypeScript contracts for media-related data.
 */

export const MediaTypeValues = {
  MOVIE: 'movie',
  TV: 'tv',
} as const;

export type MediaType = (typeof MediaTypeValues)[keyof typeof MediaTypeValues];

export const MediaAvailabilityValues = {
  TO_BE_REQUESTED: 'to_be_requested',
  PREVIOUSLY_REQUESTED: 'previously_requested',
  AVAILABLE: 'available',
} as const;

export type MediaAvailabilityType =
  (typeof MediaAvailabilityValues)[keyof typeof MediaAvailabilityValues];

/**
 * Jellyseerr mediaInfo.status codes
 *
 * 1 = UNKNOWN - Media exists in Jellyseerr but status unclear (may have been requested & rejected)
 * 2 = PENDING - Request is pending approval
 * 3 = PROCESSING - Request is being processed
 * 4 = PARTIALLY_AVAILABLE - Some content available (e.g., some seasons)
 * 5 = AVAILABLE - Fully available in library
 * 6 = DELETED - Was requested but later deleted
 */
export const JellyseerrStatusValues = {
  UNKNOWN: 1,
  PENDING: 2,
  PROCESSING: 3,
  PARTIALLY_AVAILABLE: 4,
  AVAILABLE: 5,
  DELETED: 6,
} as const;

export type JellyseerrStatus = (typeof JellyseerrStatusValues)[keyof typeof JellyseerrStatusValues];
