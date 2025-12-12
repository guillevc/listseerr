import type { JellyseerrConfig } from '@/server/domain/entities/jellyseerr-config.entity';
import type { Nullable } from 'shared/domain/types/utility.types';

/**
 * Repository interface for Jellyseerr Config (Port)
 *
 * Defines the contract for persistence operations.
 * Implementation is in the infrastructure layer.
 */
export interface IJellyseerrConfigRepository {
  /**
   * Find config by user ID
   * Returns null if no config exists for user
   */
  findByUserId(userId: number): Promise<Nullable<JellyseerrConfig>>;

  /**
   * Save (create or update) a JellyseerrConfig entity
   * Repository determines if this is insert or update based on entity existence
   */
  save(entity: JellyseerrConfig): Promise<JellyseerrConfig>;

  /**
   * Delete config by user ID
   */
  deleteByUserId(userId: number): Promise<void>;
}
