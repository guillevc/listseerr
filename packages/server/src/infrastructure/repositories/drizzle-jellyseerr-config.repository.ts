import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq } from 'drizzle-orm';
import * as schema from '@/server/infrastructure/db/schema';
import { jellyseerrConfigs } from '@/server/infrastructure/db/schema';
import { JellyseerrConfig } from '@/server/domain/entities/jellyseerr-config.entity';
import { JellyseerrUrlVO } from 'shared/domain/value-objects/jellyseerr-url.vo';
import { JellyseerrApiKeyVO } from 'shared/domain/value-objects/jellyseerr-api-key.vo';
import { JellyseerrUserIdVO } from 'shared/domain/value-objects/jellyseerr-user-id.vo';
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
          apiKey: entity.apiKey.getValue(),
          userIdJellyseerr: entity.userIdJellyseerr.getValue(),
          updatedAt: entity.updatedAt,
        })
        .where(eq(jellyseerrConfigs.userId, entity.userId))
        .returning();

      return this.toDomain(row);
    } else {
      // Insert new entity
      const [row] = await this.db
        .insert(jellyseerrConfigs)
        .values({
          userId: entity.userId,
          url: entity.url.getValue(),
          apiKey: entity.apiKey.getValue(),
          userIdJellyseerr: entity.userIdJellyseerr.getValue(),
        })
        .returning();

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
      url: JellyseerrUrlVO.create(row.url),
      apiKey: JellyseerrApiKeyVO.create(row.apiKey),
      userIdJellyseerr: JellyseerrUserIdVO.create(row.userIdJellyseerr),
      createdAt: row.createdAt || new Date(),
      updatedAt: row.updatedAt || new Date(),
    });
  }
}
