import type { IJellyseerrStatsService, JellyseerrConfigDTO } from '../../application/services/jellyseerr-stats.service.interface';
import { getPendingRequestsCount } from '../../services/jellyseerr/client';
import type { JellyseerrConfig } from '../../db/schema';

/**
 * JellyseerrStatsAdapter
 *
 * Infrastructure adapter that wraps the legacy Jellyseerr client.
 * Implements IJellyseerrStatsService interface.
 *
 * Implementation Details:
 * - Wraps existing getPendingRequestsCount() function
 * - Config DTO matches legacy client signature
 */
export class JellyseerrStatsAdapter implements IJellyseerrStatsService {
  async getPendingRequestsCount(config: JellyseerrConfigDTO): Promise<number> {
    // Legacy client expects full JellyseerrConfig from schema
    // Our DTO only has the required fields, cast to compatible type
    return await getPendingRequestsCount(config as unknown as JellyseerrConfig);
  }
}
