/**
 * ExecutionStatus Value Object
 *
 * Represents the lifecycle status of a processing execution.
 * Enforces valid state transitions and type safety.
 */
export class ExecutionStatus {
  private constructor(private readonly value: 'running' | 'success' | 'error') {}

  static running(): ExecutionStatus {
    return new ExecutionStatus('running');
  }

  static success(): ExecutionStatus {
    return new ExecutionStatus('success');
  }

  static error(): ExecutionStatus {
    return new ExecutionStatus('error');
  }

  static fromString(value: string): ExecutionStatus {
    if (value !== 'running' && value !== 'success' && value !== 'error') {
      throw new Error(
        `Invalid execution status: ${value}. Must be 'running', 'success', or 'error'.`
      );
    }

    return new ExecutionStatus(value);
  }

  isRunning(): boolean {
    return this.value === 'running';
  }

  isSuccess(): boolean {
    return this.value === 'success';
  }

  isError(): boolean {
    return this.value === 'error';
  }

  isCompleted(): boolean {
    return this.value === 'success' || this.value === 'error';
  }

  getValue(): 'running' | 'success' | 'error' {
    return this.value;
  }

  equals(other: ExecutionStatus): boolean {
    return this.value === other.value;
  }
}
