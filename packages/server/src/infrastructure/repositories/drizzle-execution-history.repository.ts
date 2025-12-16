import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq, desc, and } from 'drizzle-orm';
import * as schema from '@/server/infrastructure/db/schema';
import { executionHistory, mediaLists } from '@/server/infrastructure/db/schema';
import { ProcessingExecution } from '@/server/domain/entities/processing-execution.entity';
import { ExecutionStatusVO } from 'shared/domain/value-objects/execution-status.vo';
import { TriggerTypeVO } from 'shared/domain/value-objects/trigger-type.vo';
import { BatchIdVO } from 'shared/domain/value-objects/batch-id.vo';
import type { IExecutionHistoryRepository } from '@/server/application/repositories/execution-history.repository.interface';

export class DrizzleExecutionHistoryRepository implements IExecutionHistoryRepository {
  constructor(private readonly db: BunSQLiteDatabase<typeof schema>) {}

  async findById(id: number): Promise<ProcessingExecution | null> {
    const [row] = await this.db
      .select()
      .from(executionHistory)
      .where(eq(executionHistory.id, id))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  async findByListId(
    listId: number,
    userId: number,
    limit: number
  ): Promise<ProcessingExecution[]> {
    // Defense-in-depth: JOIN with mediaLists to ensure the list belongs to the user
    const rows = await this.db
      .select({
        eh: executionHistory,
      })
      .from(executionHistory)
      .innerJoin(mediaLists, eq(executionHistory.listId, mediaLists.id))
      .where(and(eq(executionHistory.listId, listId), eq(mediaLists.userId, userId)))
      .orderBy(desc(executionHistory.startedAt))
      .limit(limit);

    return rows.map((row) => this.toDomain(row.eh));
  }

  async findByBatchId(batchId: string): Promise<ProcessingExecution[]> {
    const rows = await this.db
      .select()
      .from(executionHistory)
      .where(eq(executionHistory.batchId, batchId))
      .orderBy(desc(executionHistory.startedAt));

    return rows.map((row) => this.toDomain(row));
  }

  async save(execution: ProcessingExecution): Promise<ProcessingExecution> {
    const entityExists = await this.exists(execution.id);

    if (entityExists) {
      // Update existing execution
      const [row] = await this.db
        .update(executionHistory)
        .set({
          completedAt: execution.completedAt,
          status: execution.status.getValue(),
          itemsFound: execution.itemsFound,
          itemsRequested: execution.itemsRequested,
          itemsFailed: execution.itemsFailed,
          itemsSkippedAvailable: execution.itemsSkippedAvailable,
          itemsSkippedPreviouslyRequested: execution.itemsSkippedPreviouslyRequested,
          errorMessage: execution.errorMessage,
        })
        .where(eq(executionHistory.id, execution.id))
        .returning();

      return this.toDomain(row);
    } else {
      // Insert new execution
      const [row] = await this.db
        .insert(executionHistory)
        .values({
          listId: execution.listId,
          batchId: execution.batchId.getValue(),
          startedAt: execution.startedAt,
          status: execution.status.getValue(),
          triggerType: execution.triggerType.getValue(),
        })
        .returning();

      return this.toDomain(row);
    }
  }

  /**
   * Check if execution exists in database
   */
  private async exists(id: number): Promise<boolean> {
    if (id === 0) return false; // New entities have ID 0

    const [row] = await this.db
      .select({ id: executionHistory.id })
      .from(executionHistory)
      .where(eq(executionHistory.id, id))
      .limit(1);

    return !!row;
  }

  /**
   * Convert Drizzle row to ProcessingExecution domain entity
   */
  private toDomain(row: typeof executionHistory.$inferSelect): ProcessingExecution {
    if (!row.batchId) {
      throw new Error(`Execution ${row.id} has no batchId`);
    }

    return new ProcessingExecution({
      id: row.id,
      listId: row.listId,
      batchId: BatchIdVO.fromString(row.batchId),
      status: ExecutionStatusVO.create(row.status),
      triggerType: TriggerTypeVO.create(row.triggerType),
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      itemsFound: row.itemsFound || 0,
      itemsRequested: row.itemsRequested || 0,
      itemsFailed: row.itemsFailed || 0,
      itemsSkippedAvailable: row.itemsSkippedAvailable || 0,
      itemsSkippedPreviouslyRequested: row.itemsSkippedPreviouslyRequested || 0,
      errorMessage: row.errorMessage,
    });
  }
}
