import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq, and } from 'drizzle-orm';
import * as schema from '@/server/infrastructure/db/schema';
import { providerConfigs } from '@/server/infrastructure/db/schema';
import { MdbListConfig } from '@/server/domain/entities/mdblist-config.entity';
import { MdbListApiKeyVO } from 'shared/domain/value-objects/mdblist-api-key.vo';
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
          apiKey: this.encryptValue(entity.apiKey.getValue()),
          updatedAt: new Date(),
        })
        .where(eq(providerConfigs.id, entity.id))
        .returning();

      return this.toDomain(row);
    }

    const [row] = await this.db
      .insert(providerConfigs)
      .values({
        userId: entity.userId,
        provider: this.PROVIDER,
        clientId: null,
        apiKey: this.encryptValue(entity.apiKey.getValue()),
      })
      .returning();

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

  private encryptValue(plaintext: string): string {
    return this.encryptionService.encrypt(plaintext);
  }

  private decryptValue(ciphertext: string | null): string {
    if (!ciphertext) return '';

    if (ciphertext.startsWith('aes-256-gcm:')) {
      return this.encryptionService.decrypt(ciphertext);
    }

    return ciphertext;
  }

  private toDomain(row: typeof providerConfigs.$inferSelect): MdbListConfig {
    return new MdbListConfig({
      id: row.id,
      userId: row.userId,
      apiKey: MdbListApiKeyVO.create(this.decryptValue(row.apiKey)),
      createdAt: row.createdAt || new Date(),
      updatedAt: row.updatedAt || new Date(),
    });
  }
}
