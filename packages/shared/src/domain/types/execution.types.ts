/**
 * Execution Types
 *
 * Pure TypeScript contracts for execution-related data.
 */

export const ExecutionStatusValues = {
  RUNNING: 'running',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export type ExecutionStatusType =
  (typeof ExecutionStatusValues)[keyof typeof ExecutionStatusValues];
