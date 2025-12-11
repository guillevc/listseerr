import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { generalSettings } from '../../db/schema';
import { GeneralSettings } from '../../domain/entities/general-settings.entity';
import { Timezone } from '../../../shared/domain/value-objects/timezone.value-object';
import type { GeneralSettingsProps } from '../../domain/types/general-settings.types';
import type { IGeneralSettingsRepository } from '../../application/repositories/general-settings.repository.interface';
import type { Nullable } from '../../../shared/types';

export class DrizzleGeneralSettingsRepository implements IGeneralSettingsRepository {
  constructor(private readonly db: BunSQLiteDatabase<typeof schema>) {}

  async findByUserId(userId: number): Promise<Nullable<GeneralSettings>> {
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
          timezone: entity.timezone.getValue(),
          automaticProcessingEnabled: entity.automaticProcessingEnabled,
          automaticProcessingSchedule: entity.automaticProcessingSchedule,
          updatedAt: entity.updatedAt,
        })
        .where(eq(generalSettings.userId, entity.userId))
        .returning();

      return this.toDomain(row);
    } else {
      // Insert new entity
      const [row] = await this.db
        .insert(generalSettings)
        .values({
          userId: entity.userId,
          timezone: entity.timezone.getValue(),
          automaticProcessingEnabled: entity.automaticProcessingEnabled,
          automaticProcessingSchedule: entity.automaticProcessingSchedule,
        })
        .returning();

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
   */
  private toDomain(row: typeof generalSettings.$inferSelect): GeneralSettings {
    return new GeneralSettings(this.toDomainProps(row));
  }

  /**
   * Convert Drizzle row to GeneralSettingsProps (plain object)
   */
  private toDomainProps(row: typeof generalSettings.$inferSelect): GeneralSettingsProps {
    return {
      id: row.id,
      userId: row.userId,
      timezone: Timezone.create(row.timezone),
      automaticProcessingEnabled: row.automaticProcessingEnabled,
      automaticProcessingSchedule: row.automaticProcessingSchedule || null,
      createdAt: row.createdAt || new Date(),
      updatedAt: row.updatedAt || new Date(),
    };
  }
}
