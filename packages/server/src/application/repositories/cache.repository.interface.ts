import type { MediaItemVO } from 'shared/domain/value-objects/media-item.vo';

/**
 * Cache Repository Interface (Port)
 *
 * Manages the global cache of requested media items to prevent duplicates.
 * Cache is global across all lists - same TMDB ID won't be requested twice.
 */
export interface ICacheRepository {
  /**
   * Get all TMDB IDs that have been requested (global cache)
   */
  getRequestedTmdbIds(): Promise<Set<number>>;

  /**
   * Filter out items that are already cached
   * Returns only new items that haven't been requested before
   */
  filterAlreadyCached(items: MediaItemVO[]): Promise<MediaItemVO[]>;

  /**
   * Cache successfully requested items
   * Uses listId to track which list first requested each item
   */
  cacheItems(listId: number, items: MediaItemVO[]): Promise<void>;
}
