import type { SeerrConfig } from '@/server/domain/entities/seerr-config.entity';

/**
 * Repository interface for Seerr Config (Port)
 *
 * Defines the contract for persistence operations.
 * Implementation is in the infrastructure layer.
 */
export interface ISeerrConfigRepository {
  /**
   * Find config by user ID
   * Returns null if no config exists for user
   */
  findByUserId(userId: number): Promise<SeerrConfig | null>;

  /**
   * Save (create or update) a SeerrConfig entity
   * Repository determines if this is insert or update based on entity existence
   */
  save(entity: SeerrConfig): Promise<SeerrConfig>;

  /**
   * Delete config by user ID
   */
  deleteByUserId(userId: number): Promise<void>;
}
