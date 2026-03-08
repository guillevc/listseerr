import type { ISeerrConfigRepository } from '@/server/application/repositories/seerr-config.repository.interface';
import type { ISeerrStatsService } from '@/server/application/services/seerr-stats.service.interface';
import type { GetPendingRequestsCommand } from 'shared/application/dtos';
import type { GetPendingRequestsResponse } from 'shared/application/dtos';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';

/**
 * GetPendingRequestsUseCase
 *
 * Fetches pending requests count from Seerr API.
 *
 * Business Rules:
 * - Returns "not configured" state if no Seerr config exists
 * - Returns "error" state if API call fails (graceful degradation)
 * - Never throws errors to client (dashboard should show partial data)
 */
export class GetPendingRequestsUseCase implements IUseCase<
  GetPendingRequestsCommand,
  GetPendingRequestsResponse
> {
  constructor(
    private readonly seerrConfigRepository: ISeerrConfigRepository,
    private readonly seerrStatsService: ISeerrStatsService
  ) {}

  async execute(command: GetPendingRequestsCommand): Promise<GetPendingRequestsResponse> {
    // Get Seerr config
    const config = await this.seerrConfigRepository.findByUserId(command.userId);

    // If no config, return not configured state
    if (!config) {
      return { count: 0, configured: false, error: false };
    }

    // Call Seerr API
    try {
      const count = await this.seerrStatsService.getPendingRequestsCount({
        url: config.url.getValue(),
        apiKey: config.apiKey.getValue(),
        userIdSeerr: config.userIdSeerr.getValue(),
      });

      return { count, configured: true, error: false };
    } catch {
      return { count: 0, configured: true, error: true };
    }
  }
}
