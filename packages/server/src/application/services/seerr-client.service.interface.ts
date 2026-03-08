import type { MediaItemVO } from '@/server/domain/value-objects/media-item.vo';
import type { SeerrConfig } from '@/server/domain/entities/seerr-config.entity';

/**
 * Processing Result from Seerr request batch
 */
export interface ProcessingResult {
  successful: MediaItemVO[];
  failed: Array<{ item: MediaItemVO; error: string }>;
}

/**
 * Seerr Client Service Interface (Port)
 *
 * Abstraction for submitting media requests to Seerr.
 */
export interface ISeerrClient {
  /**
   * Submit media requests to Seerr
   *
   * @param items - Media items to request
   * @param config - Seerr connection configuration
   * @returns Result with successful and failed items
   */
  requestItems(items: MediaItemVO[], config: SeerrConfig): Promise<ProcessingResult>;
}
