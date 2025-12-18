import type { MediaItemVO } from '@/server/domain/value-objects/media-item.vo';
import type { JellyseerrConfig } from '@/server/domain/entities/jellyseerr-config.entity';

/**
 * Categorized media items by availability status
 */
export interface CategorizedMediaItems {
  /** Items not in Jellyseerr - should be requested */
  toBeRequested: MediaItemVO[];
  /** Items already requested (pending/processing/deleted) - skip */
  previouslyRequested: MediaItemVO[];
  /** Items already available in library - skip */
  available: MediaItemVO[];
}

/**
 * Media Availability Checker Service Interface (Port)
 *
 * Abstraction for checking media availability status in Jellyseerr
 * before making request decisions.
 */
export interface IMediaAvailabilityChecker {
  /**
   * Check availability for multiple items and categorize them
   *
   * Uses Jellyseerr GET endpoints to check each item's status:
   * - GET /api/v1/movie/{tmdbId} for movies
   * - GET /api/v1/tv/{tmdbId} for TV shows
   *
   * @param items - Media items to check
   * @param config - Jellyseerr connection configuration
   * @returns Categorized items by availability status
   */
  checkAndCategorize(
    items: MediaItemVO[],
    config: JellyseerrConfig
  ): Promise<CategorizedMediaItems>;
}
