import type { MediaItem } from '../../../shared/domain/value-objects/media-item.value-object';
import type { JellyseerrConfig } from '../../domain/entities/jellyseerr-config.entity';

/**
 * Processing Result from Jellyseerr request batch
 */
export interface ProcessingResult {
  successful: MediaItem[];
  failed: Array<{ item: MediaItem; error: string }>;
}

/**
 * Jellyseerr Client Service Interface (Port)
 *
 * Abstraction for submitting media requests to Jellyseerr.
 */
export interface IJellyseerrClient {
  /**
   * Submit media requests to Jellyseerr
   *
   * @param items - Media items to request
   * @param config - Jellyseerr connection configuration
   * @returns Result with successful and failed items
   */
  requestItems(
    items: MediaItem[],
    config: JellyseerrConfig
  ): Promise<ProcessingResult>;
}
