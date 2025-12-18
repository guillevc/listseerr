import type { ExecutionStatusType } from '../../../domain/types/execution.types';
import type { TriggerType } from '../../../domain/types/trigger-type.types';

/**
 * Execution Core DTO
 *
 * Represents a processing execution with enriched data (includes list name).
 * Used by dashboard for recent activity display.
 * Contains only primitives.
 *
 * Used by:
 * - Dashboard stats repository
 * - Dashboard use cases
 * - tRPC router outputs
 */
export interface ExecutionDTO {
  id: number;
  listId: number | null;
  listName: string | null;
  listProvider: string | null;
  batchId: string | null;
  startedAt: Date;
  completedAt: Date | null;
  status: ExecutionStatusType;
  triggerType: TriggerType;
  itemsFound: number | null;
  itemsRequested: number | null;
  itemsFailed: number | null;
  itemsSkippedAvailable: number | null;
  itemsSkippedPreviouslyRequested: number | null;
  errorMessage: string | null;
}

/**
 * ActivityGroup DTO
 *
 * Groups executions by timestamp and trigger type for dashboard display.
 * Contains only primitives.
 */
export interface ActivityGroup {
  timestamp: Date;
  triggerType: TriggerType;
  executions: ExecutionDTO[];
}
