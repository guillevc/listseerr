import { DomainError } from './domain.error';
import { TriggerTypeValues } from '../types/trigger-type.types';

const validTriggerTypes = Object.values(TriggerTypeValues).join(', ');

/**
 * Invalid Trigger Type Error
 *
 * Thrown when an invalid trigger type is provided.
 */
export class InvalidTriggerTypeError extends DomainError {
  readonly code = 'INVALID_TRIGGER_TYPE_ERROR' as const;

  constructor(triggerType: string) {
    super(`Invalid trigger type: ${triggerType}. Must be one of: ${validTriggerTypes}`);
  }
}
