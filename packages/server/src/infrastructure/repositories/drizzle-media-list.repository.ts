import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq, desc, and, max } from 'drizzle-orm';
import * as schema from '@/server/infrastructure/db/schema';
import { mediaLists, executionHistory } from '@/server/infrastructure/db/schema';
import { MediaList } from '@/server/domain/entities/media-list.entity';
import type { IMediaListRepository } from '@/server/application/repositories/media-list.repository.interface';
import { ListNameVO } from 'shared/domain/value-objects/list-name.vo';
import { ListUrlVO } from 'shared/domain/value-objects/list-url.vo';
import { ProviderVO, type ProviderType } from 'shared/domain/value-objects/provider.vo';

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

  async findById(id: number, userId: number): Promise<MediaList | null> {
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
      createdAt: Date;
      updatedAt: Date;
      lastProcessed: Date | null;
    }[]
  > {
    // Subquery to get the most recent successful execution for each list
    // Uses GROUP BY with MAX() to ensure only one row per list
    const latestExecutions = this.db
      .select({
        listId: executionHistory.listId,
        completedAt: max(executionHistory.completedAt).as('completed_at'),
      })
      .from(executionHistory)
      .where(eq(executionHistory.status, 'success'))
      .groupBy(executionHistory.listId)
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
    const params = this.toParams(row);
    return new MediaList({
      id: params.id,
      userId: params.userId,
      name: ListNameVO.create(params.name),
      url: ListUrlVO.create(params.url),
      displayUrl: params.displayUrl,
      provider: ProviderVO.create(params.provider),
      enabled: params.enabled,
      maxItems: params.maxItems,
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
    });
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
      createdAt: row.createdAt || new Date(), // Fallback to current date if null
      updatedAt: row.updatedAt || new Date(), // Fallback to current date if null
    };
  }
}
