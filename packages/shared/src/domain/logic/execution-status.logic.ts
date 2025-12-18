/**
 * Execution Status Logic Functions
 *
 * Pure functions for execution status validation and detection.
 * Shared between frontend and server VOs (DRY principle).
 */

import { ExecutionStatusValues, type ExecutionStatusType } from '../types/execution.types';

/**
 * Checks if a value is a valid execution status.
 */
export function isValidExecutionStatus(value: string): value is ExecutionStatusType {
  return Object.values(ExecutionStatusValues).includes(value as ExecutionStatusType);
}

// Type guard functions
export function isRunning(status: ExecutionStatusType): boolean {
  return status === ExecutionStatusValues.RUNNING;
}

export function isSuccess(status: ExecutionStatusType): boolean {
  return status === ExecutionStatusValues.SUCCESS;
}

export function isError(status: ExecutionStatusType): boolean {
  return status === ExecutionStatusValues.ERROR;
}

export function isCompleted(status: ExecutionStatusType): boolean {
  return status === ExecutionStatusValues.SUCCESS || status === ExecutionStatusValues.ERROR;
}
