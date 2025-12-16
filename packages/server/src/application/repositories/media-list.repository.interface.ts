import type { MediaList } from '@/server/domain/entities/media-list.entity';
import type { ProviderType } from 'shared/domain/value-objects/provider.vo';

/**
 * MediaList Repository Interface (Port)
 *
 * Following DDD Repository Pattern:
 * - Repositories work exclusively with domain entities, never DTOs
 * - save() method handles both create and update (entity knows if it's new or existing)
 * - delete() takes entity instead of ID (entity encapsulates its own ID)
 * - Query methods return entities or plain objects for read-only operations
 *
 * This interface defines the contract that infrastructure adapters must implement.
 */
export interface IMediaListRepository {
  // Query operations - return entities or DTOs
  findAll(userId: number): Promise<MediaList[]>;
  findById(id: number, userId: number): Promise<MediaList | null>;
  findAllWithLastProcessed(userId: number): Promise<
    {
      id: number;
      userId: number;
      name: string;
      url: string;
      displayUrl: string;
      provider: ProviderType;
      enabled: boolean;
      maxItems: number;
      processingSchedule: string | null;
      createdAt: Date;
      updatedAt: Date;
      lastProcessed: Date | null;
    }[]
  >;

  // Command operations - work with entities
  /**
   * Save (create or update) a MediaList entity
   * Repository implementation determines if this is insert or update
   * based on whether the entity already exists in the database
   */
  save(entity: MediaList): Promise<MediaList>;

  /**
   * Delete a MediaList entity
   * Entity encapsulates its own ID, so we pass the full entity
   */
  delete(entity: MediaList): Promise<void>;

  // Bulk operations
  enableAll(userId: number): Promise<void>;

  // Utility
  exists(id: number, userId: number): Promise<boolean>;
}
