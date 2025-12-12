import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq, desc, and } from 'drizzle-orm';
import * as schema from '@/infrastructure/db/schema';
import { mediaLists, executionHistory } from '@/infrastructure/db/schema';
import { MediaList } from '@/domain/entities/media-list.entity';
import type { IMediaListRepository } from '@/application/repositories/media-list.repository.interface';
import type { Nullable } from 'shared/domain/types/utility.types';
import type { ProviderType } from 'shared/domain/types/provider.types';

export class DrizzleMediaListRepository implements IMediaListRepository {
  constructor(private readonly db: BunSQLiteDatabase<typeof schema>) {}

  async findAll(userId: number): Promise<MediaList[]> {
    const rows = await this.db
      .select()
      .from(mediaLists)
      .where(eq(mediaLists.userId, userId))
      .orderBy(desc(mediaLists.createdAt));

    return rows.map((row) => this.toDomain(row));
  }

  async findById(id: number, userId: number): Promise<Nullable<MediaList>> {
    const [row] = await this.db
      .select()
      .from(mediaLists)
      .where(and(eq(mediaLists.id, id), eq(mediaLists.userId, userId)))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  async findAllWithLastProcessed(userId: number): Promise<
    {
      id: number;
      userId: number;
      name: string;
      url: string;
      displayUrl: string;
      provider: ProviderType;
      enabled: boolean;
      maxItems: number;
      processingSchedule: Nullable<string>;
      createdAt: Date;
      updatedAt: Date;
      lastProcessed: Nullable<Date>;
    }[]
  > {
    // Subquery to get the most recent successful execution for each list
    const latestExecutions = this.db
      .select({
        listId: executionHistory.listId,
        completedAt: executionHistory.completedAt,
      })
      .from(executionHistory)
      .where(eq(executionHistory.status, 'success'))
      .orderBy(desc(executionHistory.completedAt))
      .as('latest_executions');

    // Main query with left join to get lists with their last processed date
    const rows = await this.db
      .select({
        list: mediaLists,
        lastProcessed: latestExecutions.completedAt,
      })
      .from(mediaLists)
      .leftJoin(latestExecutions, eq(mediaLists.id, latestExecutions.listId))
      .where(eq(mediaLists.userId, userId))
      .orderBy(desc(mediaLists.createdAt));

    return rows.map((row) => {
      const params = this.toParams(row.list);
      return {
        ...params,
        lastProcessed: row.lastProcessed || null,
      };
    });
  }

  /**
   * Save (create or update) a MediaList entity
   * Determines operation based on whether entity exists in database
   */
  async save(entity: MediaList): Promise<MediaList> {
    const entityExists = await this.exists(entity.id, entity.userId);

    if (entityExists) {
      // Update existing entity
      const [row] = await this.db
        .update(mediaLists)
        .set({
          name: entity.name.getValue(),
          url: entity.url.getValue(),
          displayUrl: entity.displayUrl,
          provider: entity.provider.getValue(),
          enabled: entity.enabled,
          maxItems: entity.maxItems,
          processingSchedule: entity.processingSchedule,
          updatedAt: entity.updatedAt,
        })
        .where(eq(mediaLists.id, entity.id))
        .returning();

      return this.toDomain(row);
    } else {
      // Insert new entity
      const [row] = await this.db
        .insert(mediaLists)
        .values({
          userId: entity.userId,
          name: entity.name.getValue(),
          url: entity.url.getValue(),
          displayUrl: entity.displayUrl,
          provider: entity.provider.getValue(),
          enabled: entity.enabled,
          maxItems: entity.maxItems,
          processingSchedule: entity.processingSchedule,
        })
        .returning();

      return this.toDomain(row);
    }
  }

  /**
   * Delete a MediaList entity
   * Takes full entity instead of ID (entity encapsulates its own ID)
   */
  async delete(entity: MediaList): Promise<void> {
    await this.db.delete(mediaLists).where(eq(mediaLists.id, entity.id));
  }

  async enableAll(userId: number): Promise<void> {
    await this.db
      .update(mediaLists)
      .set({ enabled: true, updatedAt: new Date() })
      .where(eq(mediaLists.userId, userId));
  }

  async exists(id: number, userId: number): Promise<boolean> {
    const [row] = await this.db
      .select({ id: mediaLists.id })
      .from(mediaLists)
      .where(and(eq(mediaLists.id, id), eq(mediaLists.userId, userId)))
      .limit(1);

    return !!row;
  }

  /**
   * Convert Drizzle row to MediaList domain entity
   */
  private toDomain(row: typeof mediaLists.$inferSelect): MediaList {
    return new MediaList(this.toParams(row));
  }

  /**
   * Convert Drizzle row to constructor parameters
   * Shared by both toDomain() and findAllWithLastProcessed()
   */
  private toParams(row: typeof mediaLists.$inferSelect): {
    id: number;
    userId: number;
    name: string;
    url: string;
    displayUrl: string;
    provider: ProviderType;
    enabled: boolean;
    maxItems: number;
    processingSchedule: Nullable<string>;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: row.id,
      userId: row.userId,
      name: row.name,
      url: row.url,
      displayUrl: row.displayUrl || row.url, // Fallback to url if displayUrl is null
      provider: row.provider,
      enabled: row.enabled,
      maxItems: row.maxItems || 50, // Default to 50 if null
      processingSchedule: row.processingSchedule || null,
      createdAt: row.createdAt || new Date(), // Fallback to current date if null
      updatedAt: row.updatedAt || new Date(), // Fallback to current date if null
    };
  }
}
