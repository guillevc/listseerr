import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq, and } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { providerConfigs } from '../../db/schema';
import { ProviderConfig } from '../../domain/entities/provider-config.entity';
import { ProviderType } from '../../domain/value-objects/provider-type.value-object';
import { TraktClientId } from '../../domain/value-objects/trakt-client-id.value-object';
import { MdbListApiKey } from '../../domain/value-objects/mdblist-api-key.value-object';
import type { ProviderConfigProps, ProviderConfigData } from '../../domain/types/provider-config.types';
import type { IProviderConfigRepository } from '../../application/repositories/provider-config.repository.interface';
import type { IEncryptionService } from '../../application/services/encryption.service.interface';
import type { Nullable } from '../../../shared/types';

export class DrizzleProviderConfigRepository implements IProviderConfigRepository {
  constructor(
    private readonly db: BunSQLiteDatabase<typeof schema>,
    private readonly encryptionService: IEncryptionService
  ) {}

  async findByUserIdAndProvider(
    userId: number,
    provider: ProviderType
  ): Promise<Nullable<ProviderConfig>> {
    const [row] = await this.db
      .select()
      .from(providerConfigs)
      .where(
        and(
          eq(providerConfigs.userId, userId),
          eq(providerConfigs.provider, provider.getValue())
        )
      )
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  async save(entity: ProviderConfig): Promise<ProviderConfig> {
    const entityExists = await this.exists(entity.userId, entity.provider);

    if (entityExists) {
      // Update existing entity (encrypt before persisting)
      const [row] = await this.db
        .update(providerConfigs)
        .set({
          clientId: this.encryptValue(entity.isTraktConfig() ? entity.config.clientId.getValue() : null),
          apiKey: this.encryptValue(entity.isMdbListConfig() ? entity.config.apiKey.getValue() : null),
          updatedAt: entity.updatedAt,
        })
        .where(
          and(
            eq(providerConfigs.userId, entity.userId),
            eq(providerConfigs.provider, entity.provider.getValue())
          )
        )
        .returning();

      return this.toDomain(row);
    } else {
      // Insert new entity (encrypt before persisting)
      const [row] = await this.db
        .insert(providerConfigs)
        .values({
          userId: entity.userId,
          provider: entity.provider.getValue(),
          clientId: this.encryptValue(entity.isTraktConfig() ? entity.config.clientId.getValue() : null),
          apiKey: this.encryptValue(entity.isMdbListConfig() ? entity.config.apiKey.getValue() : null),
        })
        .returning();

      return this.toDomain(row);
    }
  }

  async deleteByUserIdAndProvider(userId: number, provider: ProviderType): Promise<void> {
    await this.db
      .delete(providerConfigs)
      .where(
        and(
          eq(providerConfigs.userId, userId),
          eq(providerConfigs.provider, provider.getValue())
        )
      );
  }

  /**
   * Check if config exists for user and provider
   */
  private async exists(userId: number, provider: ProviderType): Promise<boolean> {
    const [row] = await this.db
      .select({ id: providerConfigs.id })
      .from(providerConfigs)
      .where(
        and(
          eq(providerConfigs.userId, userId),
          eq(providerConfigs.provider, provider.getValue())
        )
      )
      .limit(1);

    return !!row;
  }

  /**
   * Encrypt value for storage (null-safe)
   * Always encrypts values before persisting to database
   */
  private encryptValue(plaintext: string | null): string | null {
    if (!plaintext) return null;
    return this.encryptionService.encrypt(plaintext);
  }

  /**
   * Decrypt value from storage (null-safe, hybrid mode)
   * Supports both encrypted and legacy plaintext data for zero-downtime migration
   */
  private decryptValue(ciphertext: string | null): string {
    if (!ciphertext) return '';

    // Hybrid mode: Detect encrypted vs plaintext
    if (ciphertext.startsWith('aes-256-gcm:')) {
      return this.encryptionService.decrypt(ciphertext);
    }

    // Legacy plaintext data (will be encrypted on next update)
    return ciphertext;
  }

  /**
   * Convert Drizzle row to ProviderConfig domain entity
   */
  private toDomain(row: typeof providerConfigs.$inferSelect): ProviderConfig {
    return new ProviderConfig(this.toDomainProps(row));
  }

  /**
   * Convert Drizzle row to ProviderConfigProps (plain object with VOs)
   * Decrypts sensitive data when loading from database
   */
  private toDomainProps(row: typeof providerConfigs.$inferSelect): ProviderConfigProps {
    const providerType = ProviderType.create(row.provider);

    // Create provider-specific config data with VOs (decrypt values first)
    let configData: ProviderConfigData;
    if (providerType.isTrakt()) {
      configData = {
        clientId: TraktClientId.create(this.decryptValue(row.clientId)),
      };
    } else if (providerType.isMdbList()) {
      configData = {
        apiKey: MdbListApiKey.create(this.decryptValue(row.apiKey)),
      };
    } else {
      throw new Error(`Unknown provider: ${row.provider}`);
    }

    return {
      id: row.id,
      userId: row.userId,
      provider: providerType,
      config: configData,
      createdAt: row.createdAt || new Date(),
      updatedAt: row.updatedAt || new Date(),
    };
  }
}
