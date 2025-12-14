import { TriggerTypeVO } from './trigger-type.vo';

/**
 * BatchIdVO Value Object
 *
 * Represents a unique identifier for a batch of processing executions.
 * Format: {triggerType}-{timestamp}-{randomId}
 * Example: "manual-1702100400000-a1b2c3d"
 *
 * Groups related executions together for tracking and analysis.
 */
export class BatchIdVO {
  private constructor(private readonly value: string) {}

  static generate(triggerType: TriggerTypeVO): BatchIdVO {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const batchId = `${triggerType.getValue()}-${timestamp}-${randomId}`;

    return new BatchIdVO(batchId);
  }

  static fromString(value: string): BatchIdVO {
    // Validate format: {triggerType}-{timestamp}-{randomId}
    const parts = value.split('-');

    if (parts.length !== 3) {
      throw new Error(
        `Invalid batch ID format: ${value}. Expected format: {triggerType}-{timestamp}-{randomId}`
      );
    }

    const [triggerTypeStr, timestampStr, randomId] = parts;

    // Validate trigger type
    if (triggerTypeStr !== 'manual' && triggerTypeStr !== 'scheduled') {
      throw new Error(
        `Invalid trigger type in batch ID: ${triggerTypeStr}. Must be 'manual' or 'scheduled'.`
      );
    }

    // Validate timestamp is a number
    const timestamp = Number(timestampStr);
    if (isNaN(timestamp)) {
      throw new Error(`Invalid timestamp in batch ID: ${timestampStr}. Must be a number.`);
    }

    // Validate random ID is not empty
    if (!randomId || randomId.trim() === '') {
      throw new Error('Invalid batch ID: random ID part is empty.');
    }

    return new BatchIdVO(value);
  }

  getValue(): string {
    return this.value;
  }

  /**
   * Extract trigger type from batch ID
   */
  getTriggerType(): TriggerTypeVO {
    const triggerTypeStr = this.value.split('-')[0];
    return TriggerTypeVO.create(triggerTypeStr);
  }

  /**
   * Extract timestamp from batch ID
   */
  getTimestamp(): Date {
    const timestampStr = this.value.split('-')[1];
    const timestamp = Number(timestampStr);
    return new Date(timestamp);
  }

  equals(other: BatchIdVO): boolean {
    return this.value === other.value;
  }
}
