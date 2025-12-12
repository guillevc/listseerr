import type { ExecutionStatus as ExecutionStatusType } from '../types/execution-status.types';
import { ExecutionStatusValues } from '../types/execution-status.types';
import { InvalidExecutionStatusError } from '../errors/execution-status.errors';

/**
 * ExecutionStatus Value Object
 *
 * Validates and encapsulates execution status.
 * Represents the lifecycle status of a processing execution.
 *
 * Features:
 * - Validation with descriptive error
 * - Type guard helpers (isRunning, isSuccess, isError, isCompleted)
 * - Equality comparison
 * - Static factory methods for common statuses
 */
export class ExecutionStatus {
  private constructor(private readonly value: ExecutionStatusType) {}

  // Static factory method - validates before construction
  static create(value: string): ExecutionStatus {
    if (!this.isValid(value)) {
      throw new InvalidExecutionStatusError(value);
    }
    return new ExecutionStatus(value as ExecutionStatusType);
  }

  // Validation method - reusable validation logic
  static isValid(value: string): boolean {
    return Object.values(ExecutionStatusValues).includes(value as ExecutionStatusType);
  }

  // Convenience factory methods
  static running(): ExecutionStatus {
    return new ExecutionStatus(ExecutionStatusValues.RUNNING);
  }

  static success(): ExecutionStatus {
    return new ExecutionStatus(ExecutionStatusValues.SUCCESS);
  }

  static error(): ExecutionStatus {
    return new ExecutionStatus(ExecutionStatusValues.ERROR);
  }

  // Accessor method - unwraps primitive for serialization
  getValue(): ExecutionStatusType {
    return this.value;
  }

  // Type guard helpers
  isRunning(): boolean {
    return this.value === ExecutionStatusValues.RUNNING;
  }

  isSuccess(): boolean {
    return this.value === ExecutionStatusValues.SUCCESS;
  }

  isError(): boolean {
    return this.value === ExecutionStatusValues.ERROR;
  }

  // Domain logic method
  isCompleted(): boolean {
    return (
      this.value === ExecutionStatusValues.SUCCESS || this.value === ExecutionStatusValues.ERROR
    );
  }

  // Equality comparison
  equals(other: ExecutionStatus): boolean {
    return this.value === other.value;
  }
}
