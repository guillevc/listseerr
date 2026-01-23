import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq } from 'drizzle-orm';
import * as schema from '@/server/infrastructure/db/schema';
import { jellyseerrConfigs } from '@/server/infrastructure/db/schema';
import { JellyseerrConfig } from '@/server/domain/entities/jellyseerr-config.entity';
import { JellyseerrUrlVO } from '@/server/domain/value-objects/jellyseerr-url.vo';
import { JellyseerrExternalUrlVO } from '@/server/domain/value-objects/jellyseerr-external-url.vo';
import { JellyseerrApiKeyVO } from '@/server/domain/value-objects/jellyseerr-api-key.vo';
import { JellyseerrUserIdVO } from '@/server/domain/value-objects/jellyseerr-user-id.vo';
import type { IJellyseerrConfigRepository } from '@/server/application/repositories/jellyseerr-config.repository.interface';

export class DrizzleJellyseerrConfigRepository implements IJellyseerrConfigRepository {
  constructor(private readonly db: BunSQLiteDatabase<typeof schema>) {}

  async findByUserId(userId: number): Promise<JellyseerrConfig | null> {
    const [row] = await this.db
      .select()
      .from(jellyseerrConfigs)
      .where(eq(jellyseerrConfigs.userId, userId))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  async save(entity: JellyseerrConfig): Promise<JellyseerrConfig> {
    const entityExists = await this.exists(entity.userId);

    if (entityExists) {
      // Update existing entity
      const [row] = await this.db
        .update(jellyseerrConfigs)
        .set({
          url: entity.url.getValue(),
          externalUrl: entity.externalUrl?.getValue() ?? null,
          apiKey: entity.apiKey.getValue(),
          userIdJellyseerr: entity.userIdJellyseerr.getValue(),
          updatedAt: entity.updatedAt,
        })
        .where(eq(jellyseerrConfigs.userId, entity.userId))
        .returning();

      if (!row) {
        throw new Error(`Failed to update Jellyseerr config for user ${entity.userId}`);
      }
      return this.toDomain(row);
    } else {
      // Insert new entity
      const [row] = await this.db
        .insert(jellyseerrConfigs)
        .values({
          userId: entity.userId,
          url: entity.url.getValue(),
          externalUrl: entity.externalUrl?.getValue() ?? null,
          apiKey: entity.apiKey.getValue(),
          userIdJellyseerr: entity.userIdJellyseerr.getValue(),
        })
        .returning();

      if (!row) {
        throw new Error(`Failed to insert Jellyseerr config for user ${entity.userId}`);
      }
      return this.toDomain(row);
    }
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.db.delete(jellyseerrConfigs).where(eq(jellyseerrConfigs.userId, userId));
  }

  /**
   * Check if config exists for user
   */
  private async exists(userId: number): Promise<boolean> {
    const [row] = await this.db
      .select({ id: jellyseerrConfigs.id })
      .from(jellyseerrConfigs)
      .where(eq(jellyseerrConfigs.userId, userId))
      .limit(1);

    return !!row;
  }

  /**
   * Convert Drizzle row to JellyseerrConfig domain entity
   */
  private toDomain(row: typeof jellyseerrConfigs.$inferSelect): JellyseerrConfig {
    return new JellyseerrConfig({
      id: row.id,
      userId: row.userId,
      url: JellyseerrUrlVO.fromPersistence(row.url),
      externalUrl: row.externalUrl
        ? JellyseerrExternalUrlVO.fromPersistence(row.externalUrl)
        : null,
      apiKey: JellyseerrApiKeyVO.fromPersistence(row.apiKey),
      userIdJellyseerr: JellyseerrUserIdVO.fromPersistence(row.userIdJellyseerr),
      createdAt: row.createdAt || new Date(),
      updatedAt: row.updatedAt || new Date(),
    });
  }
}
