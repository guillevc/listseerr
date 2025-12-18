/**
 * Media Availability Logic Functions
 *
 * Pure functions for media availability validation and detection.
 * Shared between frontend and server VOs (DRY principle).
 */

import { MediaAvailabilityValues, type MediaAvailabilityType } from '../types/media.types';

/**
 * Checks if a value is a valid media availability type.
 */
export function isValidMediaAvailability(value: string): value is MediaAvailabilityType {
  return Object.values(MediaAvailabilityValues).includes(value as MediaAvailabilityType);
}

// Type guard functions
export function isToBeRequested(availability: MediaAvailabilityType): boolean {
  return availability === MediaAvailabilityValues.TO_BE_REQUESTED;
}

export function isPreviouslyRequested(availability: MediaAvailabilityType): boolean {
  return availability === MediaAvailabilityValues.PREVIOUSLY_REQUESTED;
}

export function isAvailable(availability: MediaAvailabilityType): boolean {
  return availability === MediaAvailabilityValues.AVAILABLE;
}

export function shouldRequest(availability: MediaAvailabilityType): boolean {
  return availability === MediaAvailabilityValues.TO_BE_REQUESTED;
}
