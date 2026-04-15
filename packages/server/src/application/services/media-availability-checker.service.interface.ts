import type { MediaItemVO } from '@/server/domain/value-objects/media-item.vo';
import type { SeerrConfig } from '@/server/domain/entities/seerr-config.entity';

/**
 * Categorized media items by availability status
 */
export interface CategorizedMediaItems {
  /** Items not in Seerr - should be requested */
  toBeRequested: MediaItemVO[];
  /** Items already requested (pending/processing/deleted) - skip */
  previouslyRequested: MediaItemVO[];
  /** Items already available in library - skip */
  available: MediaItemVO[];
  /** Items whose availability check failed (e.g. Seerr API 500) - skip and report as failed */
  errored: Array<{ item: MediaItemVO; error: string }>;
}

/**
 * Media Availability Checker Service Interface (Port)
 *
 * Abstraction for checking media availability status in Seerr
 * before making request decisions.
 */
export interface IMediaAvailabilityChecker {
  /**
   * Check availability for multiple items and categorize them
   *
   * Uses Seerr GET endpoints to check each item's status:
   * - GET /api/v1/movie/{tmdbId} for movies
   * - GET /api/v1/tv/{tmdbId} for TV shows
   *
   * @param items - Media items to check
   * @param config - Seerr connection configuration
   * @returns Categorized items by availability status
   */
  checkAndCategorize(items: MediaItemVO[], config: SeerrConfig): Promise<CategorizedMediaItems>;
}
