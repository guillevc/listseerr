/**
 * Invalid Media Availability Error
 *
 * Thrown when an invalid media availability status is provided.
 * Valid statuses: to_be_requested, previously_requested, available
 */
export class InvalidMediaAvailabilityError extends Error {
  constructor(status: string) {
    super(
      `Invalid media availability status: ${status}. Must be one of: to_be_requested, previously_requested, available`
    );
    this.name = 'InvalidMediaAvailabilityError';
  }
}
