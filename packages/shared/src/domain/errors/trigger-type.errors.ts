/**
 * Invalid Trigger Type Error
 *
 * Thrown when an invalid trigger type is provided.
 * Valid trigger types: manual, scheduled
 */
export class InvalidTriggerTypeError extends Error {
  constructor(triggerType: string) {
    super(
      `Invalid trigger type: ${triggerType}. Must be one of: manual, scheduled`
    );
    this.name = 'InvalidTriggerTypeError';
  }
}
