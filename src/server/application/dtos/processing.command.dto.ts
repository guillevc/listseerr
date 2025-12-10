/**
 * Processing Command DTOs
 *
 * Input data for processing use cases.
 * Contain only primitives - no value objects or entities.
 */

export interface ProcessListCommand {
  listId: number;
  triggerType: 'manual' | 'scheduled';
  userId: number;
}

export interface ProcessBatchCommand {
  triggerType: 'manual' | 'scheduled';
  userId: number;
}

export interface GetExecutionHistoryCommand {
  listId: number;
  limit: number;
  userId: number;
}
