import type {
  ISeerrStatsService,
  SeerrConfigDTO,
} from '@/server/application/services/seerr-stats.service.interface';
import { getPendingRequestsCount } from '@/server/infrastructure/services/external/seerr/client';
import type { SeerrConfig } from '@/server/infrastructure/db/schema';

/**
 * SeerrStatsAdapter
 *
 * Infrastructure adapter that wraps the legacy Seerr client.
 * Implements ISeerrStatsService interface.
 *
 * Implementation Details:
 * - Wraps existing getPendingRequestsCount() function
 * - Config DTO matches legacy client signature
 */
export class SeerrStatsAdapter implements ISeerrStatsService {
  async getPendingRequestsCount(config: SeerrConfigDTO): Promise<number> {
    // Legacy client expects full SeerrConfig from schema
    // Our DTO only has the required fields, cast to compatible type
    return await getPendingRequestsCount(config as unknown as SeerrConfig);
  }
}
