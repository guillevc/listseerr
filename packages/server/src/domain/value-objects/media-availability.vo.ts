/**
 * Media Availability Value Object
 *
 * Server-only VO that handles media availability status.
 * Contains business logic for mapping Seerr statuses.
 * Delegates validation logic to shared logic functions (DRY).
 */

import { InvalidMediaAvailabilityError } from 'shared/domain/errors';
import {
  MediaAvailabilityValues,
  SeerrStatusValues,
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
   * Creates a VO from Seerr mediaInfo.status.
   * This is server-side business logic for external API mapping.
   *
   * @param status - The status code (1-6 known, >=7 undocumented, null = not found)
   * @param hasRequests - Whether mediaInfo.requests[] is non-empty (only affects UNDOCUMENTED_STATE)
   */
  static fromSeerrStatus(
    status: number | null | undefined,
    hasRequests: boolean = false
  ): MediaAvailabilityVO {
    if (status === null || status === undefined) {
      return this.toBeRequested();
    }

    switch (status) {
      case SeerrStatusValues.UNKNOWN:
      case SeerrStatusValues.PENDING:
      case SeerrStatusValues.PROCESSING:
      case SeerrStatusValues.DELETED:
        return this.previouslyRequested();

      case SeerrStatusValues.PARTIALLY_AVAILABLE:
      case SeerrStatusValues.AVAILABLE:
        return this.available();

      default:
        // Undocumented states (>= 7): check hasRequests
        if (status >= SeerrStatusValues.UNDOCUMENTED_STATE) {
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
  static fromCombinedSeerrStatus(
    status: number | null | undefined,
    status4k: number | null | undefined,
    hasRequests: boolean = false
  ): MediaAvailabilityVO {
    const standardAvailability = this.fromSeerrStatus(status, hasRequests);
    const fourKAvailability = this.fromSeerrStatus(status4k, hasRequests);

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
