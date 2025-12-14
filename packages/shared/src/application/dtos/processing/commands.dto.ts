import type { TriggerType } from '../../../domain/value-objects/trigger-type.vo';

/**
 * Processing Command DTOs
 *
 * Input data for processing use cases.
 * Contain only primitives - no value objects or entities.
 */

export interface ProcessListCommand {
  listId: number;
  triggerType: TriggerType;
  userId: number;
}

export interface ProcessBatchCommand {
  triggerType: TriggerType;
  userId: number;
}

export interface GetExecutionHistoryCommand {
  listId: number;
  limit: number;
  userId: number;
}
