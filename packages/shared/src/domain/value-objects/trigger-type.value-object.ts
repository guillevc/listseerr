import type { TriggerType as TriggerTypeType } from '../types/trigger-type.types';
import { TriggerTypeValues } from '../types/trigger-type.types';
import { InvalidTriggerTypeError } from '../errors/trigger-type.errors';

/**
 * TriggerType Value Object
 *
 * Validates and encapsulates trigger type.
 * Represents the source that triggered a processing execution.
 *
 * Features:
 * - Validation with descriptive error
 * - Type guard helpers (isManual, isScheduled)
 * - Equality comparison
 * - Static factory methods for common types
 */
export class TriggerType {
  private constructor(private readonly value: TriggerTypeType) {}

  // Static factory method - validates before construction
  static create(value: string): TriggerType {
    if (!this.isValid(value)) {
      throw new InvalidTriggerTypeError(value);
    }
    return new TriggerType(value as TriggerTypeType);
  }

  // Validation method - reusable validation logic
  static isValid(value: string): boolean {
    return Object.values(TriggerTypeValues).includes(value as TriggerTypeType);
  }

  // Convenience factory methods
  static manual(): TriggerType {
    return new TriggerType(TriggerTypeValues.MANUAL);
  }

  static scheduled(): TriggerType {
    return new TriggerType(TriggerTypeValues.SCHEDULED);
  }

  // Accessor method - unwraps primitive for serialization
  getValue(): TriggerTypeType {
    return this.value;
  }

  // Type guard helpers
  isManual(): boolean {
    return this.value === TriggerTypeValues.MANUAL;
  }

  isScheduled(): boolean {
    return this.value === TriggerTypeValues.SCHEDULED;
  }

  // Equality comparison
  equals(other: TriggerType): boolean {
    return this.value === other.value;
  }
}
