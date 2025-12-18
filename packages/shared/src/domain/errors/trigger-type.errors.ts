import { DomainError } from './domain.error';

/**
 * Invalid Trigger Type Error
 *
 * Thrown when an invalid trigger type is provided.
 * Valid trigger types: manual, scheduled
 */
export class InvalidTriggerTypeError extends DomainError {
  constructor(triggerType: string) {
    super(`Invalid trigger type: ${triggerType}. Must be one of: manual, scheduled`);
  }
}
