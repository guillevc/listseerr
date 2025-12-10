/**
 * TriggerType Value Object
 *
 * Represents the source that triggered a processing execution.
 * Used for audit trails and understanding execution context.
 */
export class TriggerType {
  private constructor(private readonly value: 'manual' | 'scheduled') {}

  static manual(): TriggerType {
    return new TriggerType('manual');
  }

  static scheduled(): TriggerType {
    return new TriggerType('scheduled');
  }

  static fromString(value: string): TriggerType {
    if (value !== 'manual' && value !== 'scheduled') {
      throw new Error(
        `Invalid trigger type: ${value}. Must be 'manual' or 'scheduled'.`
      );
    }

    return new TriggerType(value);
  }

  isManual(): boolean {
    return this.value === 'manual';
  }

  isScheduled(): boolean {
    return this.value === 'scheduled';
  }

  getValue(): 'manual' | 'scheduled' {
    return this.value;
  }

  equals(other: TriggerType): boolean {
    return this.value === other.value;
  }
}
