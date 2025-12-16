import type { ExecutionHistoryDTO } from '../core/execution-history.dto';

/**
 * Processing Response DTOs
 *
 * Output data from processing use cases.
 * Contain only primitives - no value objects or entities.
 */

export interface ProcessListResponse {
  execution: ExecutionHistoryDTO;
  /** Items skipped because they were already requested (pending/processing) */
  itemsSkippedPreviouslyRequested: number;
  /** Items skipped because they are already available in library */
  itemsSkippedAvailable: number;
}

export interface ProcessBatchResponse {
  success: boolean;
  processedLists: number;
  totalItemsFound: number;
  itemsRequested: number;
  itemsFailed: number;
  /** Items skipped because they were already requested (pending/processing) */
  itemsSkippedPreviouslyRequested: number;
  /** Items skipped because they are already available in library */
  itemsSkippedAvailable: number;
  executions: ExecutionHistoryDTO[];
}

export interface GetExecutionHistoryResponse {
  executions: ExecutionHistoryDTO[];
}
