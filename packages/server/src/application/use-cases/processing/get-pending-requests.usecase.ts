import type { IJellyseerrConfigRepository } from '../../repositories/jellyseerr-config.repository.interface';
import type { IJellyseerrStatsService } from '../../services/jellyseerr-stats.service.interface';
import type { GetPendingRequestsCommand } from 'shared/application/dtos/dashboard/commands.dto';
import type { GetPendingRequestsResponse } from 'shared/application/dtos/dashboard/responses.dto';
import { createLogger } from '../../../infrastructure/services/core/logger.service';

const logger = createLogger('dashboard:pending-requests');

/**
 * GetPendingRequestsUseCase
 *
 * Fetches pending requests count from Jellyseerr API.
 *
 * Business Rules:
 * - Returns "not configured" state if no Jellyseerr config exists
 * - Returns "error" state if API call fails (graceful degradation)
 * - Never throws errors to client (dashboard should show partial data)
 */
export class GetPendingRequestsUseCase {
  constructor(
    private readonly jellyseerrConfigRepository: IJellyseerrConfigRepository,
    private readonly jellyseerrStatsService: IJellyseerrStatsService
  ) {}

  async execute(command: GetPendingRequestsCommand): Promise<GetPendingRequestsResponse> {
    // Get Jellyseerr config
    const config = await this.jellyseerrConfigRepository.findByUserId(command.userId);

    // If no config, return not configured state
    if (!config) {
      return { count: 0, configured: false, error: false };
    }

    // Call Jellyseerr API
    try {
      const count = await this.jellyseerrStatsService.getPendingRequestsCount({
        url: config.url.getValue(),
        apiKey: config.apiKey.getValue(),
        userIdJellyseerr: config.userIdJellyseerr.getValue(),
      });

      return { count, configured: true, error: false };
    } catch (error) {
      logger.error({ error }, 'Failed to fetch pending requests count');
      return { count: 0, configured: true, error: true };
    }
  }
}
