/**
 * Execution Status Logic Functions
 *
 * Pure functions for execution status validation and detection.
 * Shared between frontend and server VOs (DRY principle).
 */

import { ExecutionStatusValues, type ExecutionStatusType } from '../types/execution.types';
import { createEnumValidator, createEnumGuard } from './enum-utils.logic';

/**
 * Checks if a value is a valid execution status.
 */
export const isValidExecutionStatus = createEnumValidator(ExecutionStatusValues);

// Type guard functions
export const isRunning = createEnumGuard(ExecutionStatusValues.RUNNING);
export const isSuccess = createEnumGuard(ExecutionStatusValues.SUCCESS);
export const isError = createEnumGuard(ExecutionStatusValues.ERROR);

/**
 * Checks if the execution status represents a completed state (success or error).
 */
export function isCompleted(status: ExecutionStatusType): boolean {
  return status === ExecutionStatusValues.SUCCESS || status === ExecutionStatusValues.ERROR;
}
