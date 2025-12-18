/**
 * Trigger Type Logic Functions
 *
 * Pure functions for trigger type display and detection behavior.
 * These are shared between the frontend and server VOs (DRY principle).
 */

import { TriggerTypeValues, type TriggerType } from '../types/trigger-type.types';

/**
 * Checks if a value is a valid trigger type.
 */
export function isValidTriggerType(value: string): value is TriggerType {
  return Object.values(TriggerTypeValues).includes(value as TriggerType);
}

// Type guard functions
export function isManual(triggerType: TriggerType): boolean {
  return triggerType === TriggerTypeValues.MANUAL;
}

export function isScheduled(triggerType: TriggerType): boolean {
  return triggerType === TriggerTypeValues.SCHEDULED;
}
