/**
 * Batch ID Value Object
 *
 * Server-only VO that handles batch IDs for processing executions.
 * Format: {triggerType}-{timestamp}-{randomId}
 */

import { TriggerTypeVO } from './trigger-type.vo';

export class BatchIdVO {
  private constructor(private readonly value: string) {}

  /**
   * Generates a new batch ID.
   */
  static generate(triggerType: TriggerTypeVO): BatchIdVO {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const batchId = `${triggerType.getValue()}-${timestamp}-${randomId}`;
    return new BatchIdVO(batchId);
  }

  /**
   * Creates a VO from a string value (for persistence).
   */
  static fromString(value: string): BatchIdVO {
    const parts = value.split('-');

    if (parts.length !== 3) {
      throw new Error(
        `Invalid batch ID format: ${value}. Expected format: {triggerType}-{timestamp}-{randomId}`
      );
    }

    const [triggerTypeStr, timestampStr, randomId] = parts;

    if (triggerTypeStr !== 'manual' && triggerTypeStr !== 'scheduled') {
      throw new Error(
        `Invalid trigger type in batch ID: ${triggerTypeStr}. Must be 'manual' or 'scheduled'.`
      );
    }

    const timestamp = Number(timestampStr);
    if (isNaN(timestamp)) {
      throw new Error(`Invalid timestamp in batch ID: ${timestampStr}. Must be a number.`);
    }

    if (!randomId || randomId.trim() === '') {
      throw new Error('Invalid batch ID: random ID part is empty.');
    }

    return new BatchIdVO(value);
  }

  getValue(): string {
    return this.value;
  }

  getTriggerType(): TriggerTypeVO {
    const triggerTypeStr = this.value.split('-')[0];
    return TriggerTypeVO.fromPersistence(triggerTypeStr);
  }

  getTimestamp(): Date {
    const timestampStr = this.value.split('-')[1];
    const timestamp = Number(timestampStr);
    return new Date(timestamp);
  }

  equals(other: BatchIdVO): boolean {
    return this.value === other.value;
  }
}
