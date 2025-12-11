/**
 * Execution Status Values
 *
 * Runtime constants for execution status identification.
 * Provides named constants for all supported execution statuses.
 *
 * Usage:
 * - Use constants instead of magic strings: `ExecutionStatusValues.RUNNING` instead of `'running'`
 * - Enables IDE autocomplete for status values
 * - Single source of truth for all execution status identifiers
 */
export const ExecutionStatusValues = {
  RUNNING: 'running',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

/**
 * Execution Status
 *
 * Union type derived from ExecutionStatusValues.
 * Automatically stays in sync with runtime values.
 * Shared between server and client for validation and type safety.
 *
 * Type is inferred as: 'running' | 'success' | 'error'
 *
 * Used by:
 * - ExecutionStatus Value Object
 * - Execution DTOs
 * - All processing-related domain logic
 */
export type ExecutionStatus = typeof ExecutionStatusValues[keyof typeof ExecutionStatusValues];
