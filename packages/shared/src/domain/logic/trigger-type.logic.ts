/**
 * Trigger Type Logic Functions
 *
 * Pure functions for trigger type display and detection behavior.
 * These are shared between the frontend and server VOs (DRY principle).
 */

import { TriggerTypeValues } from '../types/trigger-type.types';
import { createEnumValidator, createEnumGuard } from './enum-utils.logic';

/**
 * Checks if a value is a valid trigger type.
 */
export const isValidTriggerType = createEnumValidator(TriggerTypeValues);

// Type guard functions
export const isManual = createEnumGuard(TriggerTypeValues.MANUAL);
export const isScheduled = createEnumGuard(TriggerTypeValues.SCHEDULED);
