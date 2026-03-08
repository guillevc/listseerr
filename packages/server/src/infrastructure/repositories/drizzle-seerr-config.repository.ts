import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq } from 'drizzle-orm';
import * as schema from '@/server/infrastructure/db/schema';
import { seerrConfigs } from '@/server/infrastructure/db/schema';
import { SeerrConfig } from '@/server/domain/entities/seerr-config.entity';
import { SeerrUrlVO } from '@/server/domain/value-objects/seerr-url.vo';
import { SeerrExternalUrlVO } from '@/server/domain/value-objects/seerr-external-url.vo';
import { SeerrApiKeyVO } from '@/server/domain/value-objects/seerr-api-key.vo';
import { SeerrUserIdVO } from '@/server/domain/value-objects/seerr-user-id.vo';
import type { ISeerrConfigRepository } from '@/server/application/repositories/seerr-config.repository.interface';

export class DrizzleSeerrConfigRepository implements ISeerrConfigRepository {
  constructor(private readonly db: BunSQLiteDatabase<typeof schema>) {}

  async findByUserId(userId: number): Promise<SeerrConfig | null> {
    const [row] = await this.db
      .select()
      .from(seerrConfigs)
      .where(eq(seerrConfigs.userId, userId))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  async save(entity: SeerrConfig): Promise<SeerrConfig> {
    const entityExists = await this.exists(entity.userId);

    if (entityExists) {
      // Update existing entity
      const [row] = await this.db
        .update(seerrConfigs)
        .set({
          url: entity.url.getValue(),
          externalUrl: entity.externalUrl?.getValue() ?? null,
          apiKey: entity.apiKey.getValue(),
          userIdSeerr: entity.userIdSeerr.getValue(),
          updatedAt: entity.updatedAt,
        })
        .where(eq(seerrConfigs.userId, entity.userId))
        .returning();

      if (!row) {
        throw new Error(`Failed to update Seerr config for user ${entity.userId}`);
      }
      return this.toDomain(row);
    } else {
      // Insert new entity
      const [row] = await this.db
        .insert(seerrConfigs)
        .values({
          userId: entity.userId,
          url: entity.url.getValue(),
          externalUrl: entity.externalUrl?.getValue() ?? null,
          apiKey: entity.apiKey.getValue(),
          userIdSeerr: entity.userIdSeerr.getValue(),
        })
        .returning();

      if (!row) {
        throw new Error(`Failed to insert Seerr config for user ${entity.userId}`);
      }
      return this.toDomain(row);
    }
  }

  async deleteByUserId(userId: number): Promise<void> {
    await this.db.delete(seerrConfigs).where(eq(seerrConfigs.userId, userId));
  }

  /**
   * Check if config exists for user
   */
  private async exists(userId: number): Promise<boolean> {
    const [row] = await this.db
      .select({ id: seerrConfigs.id })
      .from(seerrConfigs)
      .where(eq(seerrConfigs.userId, userId))
      .limit(1);

    return !!row;
  }

  /**
   * Convert Drizzle row to SeerrConfig domain entity
   */
  private toDomain(row: typeof seerrConfigs.$inferSelect): SeerrConfig {
    return new SeerrConfig({
      id: row.id,
      userId: row.userId,
      url: SeerrUrlVO.fromPersistence(row.url),
      externalUrl: row.externalUrl ? SeerrExternalUrlVO.fromPersistence(row.externalUrl) : null,
      apiKey: SeerrApiKeyVO.fromPersistence(row.apiKey),
      userIdSeerr: SeerrUserIdVO.fromPersistence(row.userIdSeerr),
      createdAt: row.createdAt || new Date(),
      updatedAt: row.updatedAt || new Date(),
    });
  }
}
