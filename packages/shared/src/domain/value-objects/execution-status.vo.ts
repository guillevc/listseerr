import { InvalidExecutionStatusError } from '../errors/execution-status.errors';

const Values = {
  RUNNING: 'running',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export type ExecutionStatusType = (typeof Values)[keyof typeof Values];

export class ExecutionStatusVO {
  private constructor(private readonly value: ExecutionStatusType) {}

  static create(value: string): ExecutionStatusVO {
    if (!this.isValid(value)) {
      throw new InvalidExecutionStatusError(value);
    }
    return new ExecutionStatusVO(value as ExecutionStatusType);
  }

  static isValid(value: string): boolean {
    return Object.values(Values).includes(value as ExecutionStatusType);
  }

  static running(): ExecutionStatusVO {
    return new ExecutionStatusVO(Values.RUNNING);
  }

  static success(): ExecutionStatusVO {
    return new ExecutionStatusVO(Values.SUCCESS);
  }

  static error(): ExecutionStatusVO {
    return new ExecutionStatusVO(Values.ERROR);
  }

  getValue(): ExecutionStatusType {
    return this.value;
  }

  isRunning(): boolean {
    return this.value === Values.RUNNING;
  }

  isSuccess(): boolean {
    return this.value === Values.SUCCESS;
  }

  isError(): boolean {
    return this.value === Values.ERROR;
  }

  isCompleted(): boolean {
    return this.value === Values.SUCCESS || this.value === Values.ERROR;
  }

  equals(other: ExecutionStatusVO): boolean {
    return this.value === other.value;
  }
}
