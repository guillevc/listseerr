import type { ExecutionStatusType } from '../../../domain/value-objects/execution-status.vo';
import type { TriggerType } from '../../../domain/value-objects/trigger-type.vo';

/**
 * ExecutionHistory Core DTO
 *
 * Represents a processing execution history record.
 * Used by processing use cases for execution tracking.
 * Contains only primitives.
 *
 * Used by:
 * - ProcessingExecution entity toDTO() method
 * - Processing use cases
 * - tRPC router outputs
 */
export interface ExecutionHistoryDTO {
  id: number;
  listId: number;
  batchId: string;
  status: ExecutionStatusType;
  triggerType: TriggerType;
  startedAt: Date;
  completedAt: Date | null;
  itemsFound: number;
  itemsRequested: number;
  itemsFailed: number;
  errorMessage: string | null;
}
