/**
 * Processing Response DTOs
 *
 * Output data from processing use cases.
 * Contain only primitives - no value objects or entities.
 */

export interface ExecutionHistoryDTO {
  id: number;
  listId: number;
  batchId: string;
  status: 'running' | 'success' | 'error';
  triggerType: 'manual' | 'scheduled';
  startedAt: Date;
  completedAt: Date | null;
  itemsFound: number;
  itemsRequested: number;
  itemsFailed: number;
  errorMessage: string | null;
}

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
