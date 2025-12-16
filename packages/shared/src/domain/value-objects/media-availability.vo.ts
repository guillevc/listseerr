import { InvalidMediaAvailabilityError } from '../errors/media-availability.errors';

/**
 * Media availability status values (private - internal use only)
 */
const Values = {
  TO_BE_REQUESTED: 'to_be_requested',
  PREVIOUSLY_REQUESTED: 'previously_requested',
  AVAILABLE: 'available',
} as const;

/**
 * Jellyseerr mediaInfo.status codes (private - for mapping)
 *
 * 1 = UNKNOWN - Media exists in Jellyseerr but status unclear (may have been requested & rejected)
 * 2 = PENDING - Request is pending approval
 * 3 = PROCESSING - Request is being processed
 * 4 = PARTIALLY_AVAILABLE - Some content available (e.g., some seasons)
 * 5 = AVAILABLE - Fully available in library
 * 6 = DELETED - Was requested but later deleted
 */
const JellyseerrStatus = {
  UNKNOWN: 1,
  PENDING: 2,
  PROCESSING: 3,
  PARTIALLY_AVAILABLE: 4,
  AVAILABLE: 5,
  DELETED: 6,
} as const;

export type MediaAvailabilityType = (typeof Values)[keyof typeof Values];

/**
 * Media Availability Value Object
 *
 * Represents the availability status of media in Jellyseerr.
 * Used to categorize media items before making request decisions.
 *
 * Categories:
 * - TO_BE_REQUESTED: Media not in Jellyseerr, should be requested
 * - PREVIOUSLY_REQUESTED: Already requested (pending/processing/deleted)
 * - AVAILABLE: Already available in library
 */
export class MediaAvailabilityVO {
  private constructor(private readonly value: MediaAvailabilityType) {}

  /**
   * Create from a string value
   */
  static create(value: string): MediaAvailabilityVO {
    if (!this.isValid(value)) {
      throw new InvalidMediaAvailabilityError(value);
    }
    return new MediaAvailabilityVO(value as MediaAvailabilityType);
  }

  /**
   * Check if a string value is valid
   */
  static isValid(value: string): boolean {
    return Object.values(Values).includes(value as MediaAvailabilityType);
  }

  /**
   * Create from Jellyseerr mediaInfo.status
   *
   * @param status - The status from Jellyseerr API (1-6, or null/undefined if no mediaInfo)
   * @returns MediaAvailabilityVO with appropriate categorization
   */
  static fromJellyseerrStatus(status: number | null | undefined): MediaAvailabilityVO {
    // No mediaInfo → TO_BE_REQUESTED (media not in Jellyseerr at all)
    if (status === null || status === undefined) {
      return new MediaAvailabilityVO(Values.TO_BE_REQUESTED);
    }

    // UNKNOWN, PENDING, PROCESSING, or DELETED → PREVIOUSLY_REQUESTED
    // UNKNOWN is included because rejected requests stay in UNKNOWN state
    if (
      status === JellyseerrStatus.UNKNOWN ||
      status === JellyseerrStatus.PENDING ||
      status === JellyseerrStatus.PROCESSING ||
      status === JellyseerrStatus.DELETED
    ) {
      return new MediaAvailabilityVO(Values.PREVIOUSLY_REQUESTED);
    }

    // PARTIALLY_AVAILABLE or AVAILABLE → AVAILABLE
    if (status === JellyseerrStatus.PARTIALLY_AVAILABLE || status === JellyseerrStatus.AVAILABLE) {
      return new MediaAvailabilityVO(Values.AVAILABLE);
    }

    // Unknown status code - default to TO_BE_REQUESTED (safer to try than skip)
    return new MediaAvailabilityVO(Values.TO_BE_REQUESTED);
  }

  // Static factory methods
  static toBeRequested(): MediaAvailabilityVO {
    return new MediaAvailabilityVO(Values.TO_BE_REQUESTED);
  }

  static previouslyRequested(): MediaAvailabilityVO {
    return new MediaAvailabilityVO(Values.PREVIOUSLY_REQUESTED);
  }

  static available(): MediaAvailabilityVO {
    return new MediaAvailabilityVO(Values.AVAILABLE);
  }

  // Getter
  getValue(): MediaAvailabilityType {
    return this.value;
  }

  // Query methods
  isToBeRequested(): boolean {
    return this.value === Values.TO_BE_REQUESTED;
  }

  isPreviouslyRequested(): boolean {
    return this.value === Values.PREVIOUSLY_REQUESTED;
  }

  isAvailable(): boolean {
    return this.value === Values.AVAILABLE;
  }

  /**
   * Returns true if this media should be requested to Jellyseerr
   */
  shouldRequest(): boolean {
    return this.isToBeRequested();
  }

  equals(other: MediaAvailabilityVO): boolean {
    return this.value === other.value;
  }
}
