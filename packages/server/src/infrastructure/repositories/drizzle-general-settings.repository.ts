import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq } from 'drizzle-orm';
import * as schema from '@/server/infrastructure/db/schema';
import { generalSettings } from '@/server/infrastructure/db/schema';
import { GeneralSettings } from '@/server/domain/entities/general-settings.entity';
import type { IGeneralSettingsRepository } from '@/server/application/repositories/general-settings.repository.interface';

export class DrizzleGeneralSettingsRepository implements IGeneralSettingsRepository {
  constructor(private readonly db: BunSQLiteDatabase<typeof schema>) {}

  async findByUserId(userId: number): Promise<GeneralSettings | null> {
    const [row] = await this.db
      .select()
      .from(generalSettings)
      .where(eq(generalSettings.userId, userId))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  /**
   * Save (create or update) a GeneralSettings entity
   * Determines operation based on whether entity exists in database
   */
  async save(entity: GeneralSettings): Promise<GeneralSettings> {
    const entityExists = await this.exists(entity.userId);

    if (entityExists) {
      // Update existing entity
      const [row] = await this.db
        .update(generalSettings)
        .set({
          automaticProcessingEnabled: entity.automaticProcessingEnabled,
          automaticProcessingSchedule: entity.automaticProcessingSchedule,
          updatedAt: entity.updatedAt,
        })
        .where(eq(generalSettings.userId, entity.userId))
        .returning();

      if (!row) {
        throw new Error(`Failed to update general settings for user ${entity.userId}`);
      }
      return this.toDomain(row);
    } else {
      // Insert new entity
      const [row] = await this.db
        .insert(generalSettings)
        .values({
          userId: entity.userId,
          automaticProcessingEnabled: entity.automaticProcessingEnabled,
          automaticProcessingSchedule: entity.automaticProcessingSchedule,
        })
        .returning();

      if (!row) {
        throw new Error(`Failed to insert general settings for user ${entity.userId}`);
      }
      return this.toDomain(row);
    }
  }

  /**
   * Check if settings exist for user
   */
  private async exists(userId: number): Promise<boolean> {
    const [row] = await this.db
      .select({ id: generalSettings.id })
      .from(generalSettings)
      .where(eq(generalSettings.userId, userId))
      .limit(1);

    return !!row;
  }

  /**
   * Convert Drizzle row to GeneralSettings domain entity
   * Note: Timezone is no longer stored in DB - comes from TZ env var
   */
  private toDomain(row: typeof generalSettings.$inferSelect): GeneralSettings {
    return new GeneralSettings({
      id: row.id,
      userId: row.userId,
      automaticProcessingEnabled: row.automaticProcessingEnabled,
      automaticProcessingSchedule: row.automaticProcessingSchedule || null,
      createdAt: row.createdAt || new Date(),
      updatedAt: row.updatedAt || new Date(),
    });
  }
}
