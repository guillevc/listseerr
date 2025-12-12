import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq } from 'drizzle-orm';
import * as schema from '../../infrastructure/db/schema';
import { jellyseerrConfigs } from '../../infrastructure/db/schema';
import { JellyseerrConfig } from '../../domain/entities/jellyseerr-config.entity';
import { JellyseerrUrl } from 'shared/domain/value-objects/jellyseerr-url.value-object';
import { JellyseerrApiKey } from 'shared/domain/value-objects/jellyseerr-api-key.value-object';
import { JellyseerrUserId } from 'shared/domain/value-objects/jellyseerr-user-id.value-object';
import type { IJellyseerrConfigRepository } from '../../application/repositories/jellyseerr-config.repository.interface';
import type { Nullable } from 'shared/domain/types/utility.types';

export class DrizzleJellyseerrConfigRepository implements IJellyseerrConfigRepository {
  constructor(private readonly db: BunSQLiteDatabase<typeof schema>) {}

  async findByUserId(userId: number): Promise<Nullable<JellyseerrConfig>> {
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
      url: JellyseerrUrl.create(row.url),
      apiKey: JellyseerrApiKey.create(row.apiKey),
      userIdJellyseerr: JellyseerrUserId.create(row.userIdJellyseerr),
      createdAt: row.createdAt || new Date(),
      updatedAt: row.updatedAt || new Date(),
    });
  }
}
