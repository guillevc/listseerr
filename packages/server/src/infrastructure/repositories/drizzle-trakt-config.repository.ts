import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq, and } from 'drizzle-orm';
import * as schema from '@/server/infrastructure/db/schema';
import { providerConfigs } from '@/server/infrastructure/db/schema';
import { TraktConfig } from '@/server/domain/entities/trakt-config.entity';
import { TraktClientIdVO } from 'shared/domain/value-objects/trakt-client-id.vo';
import type { ITraktConfigRepository } from '@/server/application/repositories/trakt-config.repository.interface';
import type { IEncryptionService } from '@/server/application/services/encryption.service.interface';

export class DrizzleTraktConfigRepository implements ITraktConfigRepository {
  private readonly PROVIDER = 'trakt' as const;

  constructor(
    private readonly db: BunSQLiteDatabase<typeof schema>,
    private readonly encryptionService: IEncryptionService
  ) {}

  async findByUserId(userId: number): Promise<TraktConfig | null> {
    const [row] = await this.db
      .select()
      .from(providerConfigs)
      .where(and(eq(providerConfigs.userId, userId), eq(providerConfigs.provider, this.PROVIDER)))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  async save(entity: TraktConfig): Promise<TraktConfig> {
    const entityExists = await this.exists(entity.id);

    if (entityExists) {
      const [row] = await this.db
        .update(providerConfigs)
        .set({
          clientId: this.encryptValue(entity.clientId.getValue()),
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
        clientId: this.encryptValue(entity.clientId.getValue()),
        apiKey: null,
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

  async delete(entity: TraktConfig): Promise<void> {
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

  private toDomain(row: typeof providerConfigs.$inferSelect): TraktConfig {
    return new TraktConfig({
      id: row.id,
      userId: row.userId,
      clientId: TraktClientIdVO.create(this.decryptValue(row.clientId)),
      createdAt: row.createdAt || new Date(),
      updatedAt: row.updatedAt || new Date(),
    });
  }
}
