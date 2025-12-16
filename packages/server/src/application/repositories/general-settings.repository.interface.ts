import type { GeneralSettings } from '@/server/domain/entities/general-settings.entity';

/**
 * GeneralSettings Repository Interface (Port)
 *
 * Following DDD Repository Pattern:
 * - Repositories work exclusively with domain entities
 * - save() method handles both create and update
 * - Query methods return entities
 *
 * This interface defines the contract that infrastructure adapters must implement.
 */
export interface IGeneralSettingsRepository {
  /**
   * Find settings by user ID
   * Returns null if no settings exist for user
   */
  findByUserId(userId: number): Promise<GeneralSettings | null>;

  /**
   * Save (create or update) a GeneralSettings entity
   * Repository determines if this is insert or update based on entity existence
   */
  save(entity: GeneralSettings): Promise<GeneralSettings>;
}
