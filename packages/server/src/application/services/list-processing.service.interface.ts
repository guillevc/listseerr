import type { MediaItemVO } from '@/server/domain/value-objects/media-item.vo';
import type { JellyseerrConfig } from '@/server/domain/entities/jellyseerr-config.entity';

/**
 * Result of processing media items through Jellyseerr
 */
export interface ListProcessingResult {
  /** Items successfully requested to Jellyseerr */
  successful: MediaItemVO[];
  /** Items that failed to be requested */
  failed: Array<{ item: MediaItemVO; error: string }>;
  /** Items already available in library */
  available: MediaItemVO[];
  /** Items already requested previously */
  previouslyRequested: MediaItemVO[];
}

/**
 * IListProcessingService
 *
 * Shared processing logic for media items:
 * 1. Check availability in Jellyseerr
 * 2. Categorize items (available, previously requested, to be requested)
 * 3. Request only items that need requesting
 *
 * Used by both ProcessListUseCase and ProcessBatchUseCase.
 */
export interface IListProcessingService {
  /**
   * Process media items: check availability and request to Jellyseerr
   *
   * @param items - Media items to process
   * @param jellyseerrConfig - Jellyseerr configuration
   * @returns Processing result with categorized items and request outcomes
   */
  processItems(
    items: MediaItemVO[],
    jellyseerrConfig: JellyseerrConfig
  ): Promise<ListProcessingResult>;
}
