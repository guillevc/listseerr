/**
 * Trigger Type Values
 *
 * Runtime constants for trigger type identification.
 * Provides named constants for all supported trigger types.
 *
 * Usage:
 * - Use constants instead of magic strings: `TriggerTypeValues.MANUAL` instead of `'manual'`
 * - Enables IDE autocomplete for trigger type values
 * - Single source of truth for all trigger type identifiers
 */
export const TriggerTypeValues = {
  MANUAL: 'manual',
  SCHEDULED: 'scheduled',
} as const;

/**
 * Trigger Type
 *
 * Union type derived from TriggerTypeValues.
 * Automatically stays in sync with runtime values.
 * Shared between server and client for validation and type safety.
 *
 * Type is inferred as: 'manual' | 'scheduled'
 *
 * Used by:
 * - TriggerType Value Object
 * - Processing DTOs
 * - All execution-related domain logic
 */
export type TriggerType = typeof TriggerTypeValues[keyof typeof TriggerTypeValues];
