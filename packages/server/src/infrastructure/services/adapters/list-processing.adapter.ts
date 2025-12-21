import type {
  IListProcessingService,
  ListProcessingResult,
} from '@/server/application/services/list-processing.service.interface';
import type { IJellyseerrClient } from '@/server/application/services/jellyseerr-client.service.interface';
import type { IMediaAvailabilityChecker } from '@/server/application/services/media-availability-checker.service.interface';
import type { ILogger } from '@/server/application/services/core/logger.interface';
import type { MediaItemVO } from '@/server/domain/value-objects/media-item.vo';
import type { JellyseerrConfig } from '@/server/domain/entities/jellyseerr-config.entity';

/**
 * ListProcessingService
 *
 * Implements shared processing logic for media items.
 * Coordinates availability checking and Jellyseerr requests.
 */
export class ListProcessingService implements IListProcessingService {
  constructor(
    private readonly availabilityChecker: IMediaAvailabilityChecker,
    private readonly jellyseerrClient: IJellyseerrClient,
    private readonly logger: ILogger
  ) {}

  async processItems(
    items: MediaItemVO[],
    jellyseerrConfig: JellyseerrConfig
  ): Promise<ListProcessingResult> {
    // 1. Check availability and categorize items
    const categorized = await this.availabilityChecker.checkAndCategorize(items, jellyseerrConfig);

    this.logger.info(
      {
        totalItems: items.length,
        toBeRequested: categorized.toBeRequested.length,
        previouslyRequested: categorized.previouslyRequested.length,
        available: categorized.available.length,
      },
      'Media availability check completed'
    );

    // 2. Request only items that need requesting
    const results = await this.jellyseerrClient.requestItems(
      categorized.toBeRequested,
      jellyseerrConfig
    );

    this.logger.info(
      { successful: results.successful.length, failed: results.failed.length },
      'Jellyseerr requests completed'
    );

    // 3. Return combined result
    return {
      successful: results.successful,
      failed: results.failed,
      available: categorized.available,
      previouslyRequested: categorized.previouslyRequested,
    };
  }
}
