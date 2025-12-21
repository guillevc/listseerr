/**
 * Media Availability Value Object
 *
 * Server-only VO that handles media availability status.
 * Contains business logic for mapping Jellyseerr statuses.
 * Delegates validation logic to shared logic functions (DRY).
 */

import { InvalidMediaAvailabilityError } from 'shared/domain/errors';
import {
  MediaAvailabilityValues,
  JellyseerrStatusValues,
  type MediaAvailabilityType,
} from 'shared/domain/types';
import * as mediaAvailabilityLogic from 'shared/domain/logic';

export { MediaAvailabilityValues, type MediaAvailabilityType };

export class MediaAvailabilityVO {
  private constructor(private readonly value: MediaAvailabilityType) {}

  /**
   * Creates a VO from schema-validated data.
   */
  static create(value: MediaAvailabilityType): MediaAvailabilityVO {
    return new MediaAvailabilityVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   */
  static fromPersistence(value: string): MediaAvailabilityVO {
    if (!mediaAvailabilityLogic.isValidMediaAvailability(value)) {
      throw new InvalidMediaAvailabilityError(value);
    }
    return new MediaAvailabilityVO(value);
  }

  /**
   * Creates a VO from Jellyseerr mediaInfo.status.
   * This is server-side business logic for external API mapping.
   *
   * @param status - The status code (1-6 known, >=7 undocumented, null = not found)
   * @param hasRequests - Whether mediaInfo.requests[] is non-empty (only affects UNDOCUMENTED_STATE)
   */
  static fromJellyseerrStatus(
    status: number | null | undefined,
    hasRequests: boolean = false
  ): MediaAvailabilityVO {
    if (status === null || status === undefined) {
      return this.toBeRequested();
    }

    switch (status) {
      case JellyseerrStatusValues.UNKNOWN:
      case JellyseerrStatusValues.PENDING:
      case JellyseerrStatusValues.PROCESSING:
      case JellyseerrStatusValues.DELETED:
        return this.previouslyRequested();

      case JellyseerrStatusValues.PARTIALLY_AVAILABLE:
      case JellyseerrStatusValues.AVAILABLE:
        return this.available();

      default:
        // Undocumented states (>= 7): check hasRequests
        if (status >= JellyseerrStatusValues.UNDOCUMENTED_STATE) {
          return hasRequests ? this.previouslyRequested() : this.toBeRequested();
        }
        return this.toBeRequested();
    }
  }

  /**
   * Determines combined availability from both standard and 4K status.
   * Only returns TO_BE_REQUESTED if BOTH resolve to TO_BE_REQUESTED.
   *
   * @param status - Standard status code
   * @param status4k - 4K status code (null/undefined treated as TO_BE_REQUESTED)
   * @param hasRequests - Whether mediaInfo.requests[] is non-empty
   */
  static fromCombinedJellyseerrStatus(
    status: number | null | undefined,
    status4k: number | null | undefined,
    hasRequests: boolean = false
  ): MediaAvailabilityVO {
    const standardAvailability = this.fromJellyseerrStatus(status, hasRequests);
    const fourKAvailability = this.fromJellyseerrStatus(status4k, hasRequests);

    // Only request if BOTH are TO_BE_REQUESTED
    if (standardAvailability.isToBeRequested() && fourKAvailability.isToBeRequested()) {
      return this.toBeRequested();
    }

    // AVAILABLE takes priority
    if (standardAvailability.isAvailable() || fourKAvailability.isAvailable()) {
      return this.available();
    }

    // Otherwise PREVIOUSLY_REQUESTED
    return this.previouslyRequested();
  }

  // Factory methods
  static toBeRequested(): MediaAvailabilityVO {
    return new MediaAvailabilityVO(MediaAvailabilityValues.TO_BE_REQUESTED);
  }

  static previouslyRequested(): MediaAvailabilityVO {
    return new MediaAvailabilityVO(MediaAvailabilityValues.PREVIOUSLY_REQUESTED);
  }

  static available(): MediaAvailabilityVO {
    return new MediaAvailabilityVO(MediaAvailabilityValues.AVAILABLE);
  }

  getValue(): MediaAvailabilityType {
    return this.value;
  }

  isToBeRequested(): boolean {
    return mediaAvailabilityLogic.isToBeRequested(this.value);
  }

  isPreviouslyRequested(): boolean {
    return mediaAvailabilityLogic.isPreviouslyRequested(this.value);
  }

  isAvailable(): boolean {
    return mediaAvailabilityLogic.isAvailable(this.value);
  }

  shouldRequest(): boolean {
    return mediaAvailabilityLogic.shouldRequest(this.value);
  }

  equals(other: MediaAvailabilityVO): boolean {
    return this.value === other.value;
  }
}
