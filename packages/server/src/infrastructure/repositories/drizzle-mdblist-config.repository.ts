import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq, and } from 'drizzle-orm';
import * as schema from '@/server/infrastructure/db/schema';
import { providerConfigs } from '@/server/infrastructure/db/schema';
import { MdbListConfig } from '@/server/domain/entities/mdblist-config.entity';
import { MdbListApiKeyVO } from '@/server/domain/value-objects/mdblist-api-key.vo';
import type { IMdbListConfigRepository } from '@/server/application/repositories/mdblist-config.repository.interface';
import type { IEncryptionService } from '@/server/application/services/core/encryption.service.interface';

export class DrizzleMdbListConfigRepository implements IMdbListConfigRepository {
  private readonly PROVIDER = 'mdblist' as const;

  constructor(
    private readonly db: BunSQLiteDatabase<typeof schema>,
    private readonly encryptionService: IEncryptionService
  ) {}

  async findByUserId(userId: number): Promise<MdbListConfig | null> {
    const [row] = await this.db
      .select()
      .from(providerConfigs)
      .where(and(eq(providerConfigs.userId, userId), eq(providerConfigs.provider, this.PROVIDER)))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  async save(entity: MdbListConfig): Promise<MdbListConfig> {
    const entityExists = await this.exists(entity.id);

    if (entityExists) {
      const [row] = await this.db
        .update(providerConfigs)
        .set({
          apiKey: this.encryptionService.encrypt(entity.apiKey.getValue()),
          updatedAt: new Date(),
        })
        .where(eq(providerConfigs.id, entity.id))
        .returning();

      if (!row) {
        throw new Error(`Failed to update MDBList config with id ${entity.id}`);
      }
      return this.toDomain(row);
    }

    const [row] = await this.db
      .insert(providerConfigs)
      .values({
        userId: entity.userId,
        provider: this.PROVIDER,
        clientId: null,
        apiKey: this.encryptionService.encrypt(entity.apiKey.getValue()),
      })
      .returning();

    if (!row) {
      throw new Error(`Failed to insert MDBList config for user ${entity.userId}`);
    }
    return this.toDomain(row);
  }

  private async exists(id: number): Promise<boolean> {
    if (id === 0) return false;
    const [row] = await this.db
      .select({ id: providerConfigs.id })
      .from(providerConfigs)
      .where(eq(providerConfigs.id, id))
      .limit(1);
    return !!row;
  }

  async delete(entity: MdbListConfig): Promise<void> {
    await this.db.delete(providerConfigs).where(eq(providerConfigs.id, entity.id));
  }

  private toDomain(row: typeof providerConfigs.$inferSelect): MdbListConfig {
    return new MdbListConfig({
      id: row.id,
      userId: row.userId,
      apiKey: MdbListApiKeyVO.create(this.encryptionService.decryptOrPassthrough(row.apiKey)),
      createdAt: row.createdAt || new Date(),
      updatedAt: row.updatedAt || new Date(),
    });
  }
}
