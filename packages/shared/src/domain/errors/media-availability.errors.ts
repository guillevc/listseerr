import { DomainError } from './domain.error';

/**
 * Invalid Media Availability Error
 *
 * Thrown when an invalid media availability status is provided.
 * Valid statuses: to_be_requested, previously_requested, available
 */
export class InvalidMediaAvailabilityError extends DomainError {
  readonly code = 'INVALID_MEDIA_AVAILABILITY_ERROR' as const;

  constructor(status: string) {
    super(
      `Invalid media availability status: ${status}. Must be one of: to_be_requested, previously_requested, available`
    );
  }
}
