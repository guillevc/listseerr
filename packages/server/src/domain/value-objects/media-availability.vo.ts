/**
 * Media Availability Value Object
 *
 * Server-only VO that handles media availability status.
 * Contains business logic for mapping Jellyseerr statuses.
 * Delegates validation logic to shared logic functions (DRY).
 */

import { InvalidMediaAvailabilityError } from 'shared/domain/errors/media-availability.errors';
import {
  MediaAvailabilityValues,
  JellyseerrStatusValues,
  type MediaAvailabilityType,
} from 'shared/domain/types/media.types';
import * as mediaAvailabilityLogic from 'shared/domain/logic/media-availability.logic';

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
   */
  static fromJellyseerrStatus(status: number | null | undefined): MediaAvailabilityVO {
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
        return this.toBeRequested();
    }
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
    return this.value === MediaAvailabilityValues.TO_BE_REQUESTED;
  }

  isPreviouslyRequested(): boolean {
    return this.value === MediaAvailabilityValues.PREVIOUSLY_REQUESTED;
  }

  isAvailable(): boolean {
    return this.value === MediaAvailabilityValues.AVAILABLE;
  }

  shouldRequest(): boolean {
    return this.isToBeRequested();
  }

  equals(other: MediaAvailabilityVO): boolean {
    return this.value === other.value;
  }
}
