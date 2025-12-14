import type { MediaItemVO } from 'shared/domain/value-objects/media-item.vo';
import type { JellyseerrConfig } from '@/server/domain/entities/jellyseerr-config.entity';

/**
 * Processing Result from Jellyseerr request batch
 */
export interface ProcessingResult {
  successful: MediaItemVO[];
  failed: Array<{ item: MediaItemVO; error: string }>;
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
  requestItems(items: MediaItemVO[], config: JellyseerrConfig): Promise<ProcessingResult>;
}
