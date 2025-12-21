/**
 * Trigger Type Value Object
 *
 * Server-only VO that handles business invariants for trigger types.
 * Delegates logic to shared logic functions (DRY).
 */

import { InvalidTriggerTypeError } from 'shared/domain/errors';
import { TriggerTypeValues, type TriggerType } from 'shared/domain/types';
import * as triggerTypeLogic from 'shared/domain/logic';

export { TriggerTypeValues, type TriggerType };

export class TriggerTypeVO {
  private constructor(private readonly value: TriggerType) {}

  /**
   * Creates a VO from schema-validated data.
   */
  static create(value: TriggerType): TriggerTypeVO {
    return new TriggerTypeVO(value);
  }

  /**
   * Creates a VO from database/persistence data.
   */
  static fromPersistence(value: string): TriggerTypeVO {
    if (!triggerTypeLogic.isValidTriggerType(value)) {
      throw new InvalidTriggerTypeError(value);
    }
    return new TriggerTypeVO(value);
  }

  // Factory methods for convenience
  static manual(): TriggerTypeVO {
    return new TriggerTypeVO(TriggerTypeValues.MANUAL);
  }

  static scheduled(): TriggerTypeVO {
    return new TriggerTypeVO(TriggerTypeValues.SCHEDULED);
  }

  getValue(): TriggerType {
    return this.value;
  }

  // Delegate to shared logic functions
  isManual(): boolean {
    return triggerTypeLogic.isManual(this.value);
  }

  isScheduled(): boolean {
    return triggerTypeLogic.isScheduled(this.value);
  }

  equals(other: TriggerTypeVO): boolean {
    return this.value === other.value;
  }
}
