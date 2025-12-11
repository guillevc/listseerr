import type { ProcessingExecution } from '../../domain/entities/processing-execution.entity';
import type { Nullable } from '@/shared/domain/types/utility.types';

/**
 * Execution History Repository Interface (Port)
 *
 * Defines the contract for persisting and retrieving processing executions.
 * Follows DDD Repository Pattern:
 * - Works exclusively with domain entities
 * - save() handles both create and update
 * - No delete() - executions are immutable audit trail
 */
export interface IExecutionHistoryRepository {
  /**
   * Find execution by ID
   */
  findById(id: number): Promise<Nullable<ProcessingExecution>>;

  /**
   * Find all executions for a specific list, ordered by start time (newest first)
   * Validates that the list belongs to the specified userId (defense-in-depth)
   */
  findByListId(listId: number, userId: number, limit: number): Promise<ProcessingExecution[]>;

  /**
   * Find all executions in a batch
   */
  findByBatchId(batchId: string): Promise<ProcessingExecution[]>;

  /**
   * Save execution (create or update)
   * Repository determines if this is insert or update based on ID
   */
  save(execution: ProcessingExecution): Promise<ProcessingExecution>;
}
