import type { ExecutionHistoryDTO } from '../core/execution-history.dto';

/**
 * Processing Response DTOs
 *
 * Output data from processing use cases.
 * Contain only primitives - no value objects or entities.
 */

export interface ProcessListResponse {
  execution: ExecutionHistoryDTO;
}

export interface ProcessBatchResponse {
  success: boolean;
  processedLists: number;
  totalItemsFound: number;
  itemsRequested: number;
  itemsFailed: number;
  executions: ExecutionHistoryDTO[];
}

export interface GetExecutionHistoryResponse {
  executions: ExecutionHistoryDTO[];
}
