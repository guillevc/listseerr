/**
 * Execution Status Value Object
 *
 * Server-only VO that handles execution status values.
 * Delegates validation logic to shared logic functions (DRY).
 */

import { InvalidExecutionStatusError } from 'shared/domain/errors/execution-status.errors';
import {
  ExecutionStatusValues,
  type ExecutionStatusType,
} from 'shared/domain/types/execution.types';
import * as executionStatusLogic from 'shared/domain/logic/execution-status.logic';

export { ExecutionStatusValues, type ExecutionStatusType };

export class ExecutionStatusVO {
  private constructor(private readonly value: ExecutionStatusType) {}

  /**
   * Creates a VO from schema-validated data.
   */
  static create(value: ExecutionStatusType): ExecutionStatusVO {
    return new ExecutionStatusVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   */
  static fromPersistence(value: string): ExecutionStatusVO {
    if (!executionStatusLogic.isValidExecutionStatus(value)) {
      throw new InvalidExecutionStatusError(value);
    }
    return new ExecutionStatusVO(value);
  }

  // Factory methods
  static running(): ExecutionStatusVO {
    return new ExecutionStatusVO(ExecutionStatusValues.RUNNING);
  }

  static success(): ExecutionStatusVO {
    return new ExecutionStatusVO(ExecutionStatusValues.SUCCESS);
  }

  static error(): ExecutionStatusVO {
    return new ExecutionStatusVO(ExecutionStatusValues.ERROR);
  }

  getValue(): ExecutionStatusType {
    return this.value;
  }

  isRunning(): boolean {
    return this.value === ExecutionStatusValues.RUNNING;
  }

  isSuccess(): boolean {
    return this.value === ExecutionStatusValues.SUCCESS;
  }

  isError(): boolean {
    return this.value === ExecutionStatusValues.ERROR;
  }

  isCompleted(): boolean {
    return (
      this.value === ExecutionStatusValues.SUCCESS || this.value === ExecutionStatusValues.ERROR
    );
  }

  equals(other: ExecutionStatusVO): boolean {
    return this.value === other.value;
  }
}
