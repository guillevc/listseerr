import type { TraktConfig } from '@/server/domain/entities/trakt-config.entity';

/**
 * TraktConfig Repository Interface (Port)
 *
 * Defines the contract for Trakt configuration persistence.
 * Infrastructure layer provides the concrete implementation.
 */
export interface ITraktConfigRepository {
  findByUserId(userId: number): Promise<TraktConfig | null>;
  save(entity: TraktConfig): Promise<TraktConfig>;
  delete(entity: TraktConfig): Promise<void>;
}
