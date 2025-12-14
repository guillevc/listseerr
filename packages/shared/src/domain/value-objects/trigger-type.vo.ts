import { InvalidTriggerTypeError } from '../errors/trigger-type.errors';

const Values = {
  MANUAL: 'manual',
  SCHEDULED: 'scheduled',
} as const;

export type TriggerType = (typeof Values)[keyof typeof Values];

export class TriggerTypeVO {
  private constructor(private readonly value: TriggerType) {}

  static create(value: string): TriggerTypeVO {
    if (!this.isValid(value)) {
      throw new InvalidTriggerTypeError(value);
    }
    return new TriggerTypeVO(value as TriggerType);
  }

  static isValid(value: string): boolean {
    return Object.values(Values).includes(value as TriggerType);
  }

  static manual(): TriggerTypeVO {
    return new TriggerTypeVO(Values.MANUAL);
  }

  static scheduled(): TriggerTypeVO {
    return new TriggerTypeVO(Values.SCHEDULED);
  }

  getValue(): TriggerType {
    return this.value;
  }

  isManual(): boolean {
    return this.value === Values.MANUAL;
  }

  isScheduled(): boolean {
    return this.value === Values.SCHEDULED;
  }

  equals(other: TriggerTypeVO): boolean {
    return this.value === other.value;
  }
}
