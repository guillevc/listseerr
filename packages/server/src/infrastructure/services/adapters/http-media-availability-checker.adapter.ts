import type {
  IMediaAvailabilityChecker,
  CategorizedMediaItems,
} from '@/server/application/services/media-availability-checker.service.interface';
import type { JellyseerrConfig } from '@/server/domain/entities/jellyseerr-config.entity';
import type { MediaItemVO } from 'shared/domain/value-objects/media-item.vo';
import { MediaAvailabilityVO } from 'shared/domain/value-objects/media-availability.vo';
import { getMediaAvailability } from '@/server/infrastructure/services/external/jellyseerr/client';
import type { ILogger } from '@/server/application/services/core/logger.interface';

/**
 * Concurrency limit for parallel availability checks
 * Prevents overwhelming Jellyseerr API with too many requests
 */
const CONCURRENCY_LIMIT = 5;

/**
 * HTTP Media Availability Checker Adapter
 *
 * Implements IMediaAvailabilityChecker by querying Jellyseerr GET endpoints.
 * Uses parallel requests with concurrency control to balance speed and API limits.
 */
export class HttpMediaAvailabilityChecker implements IMediaAvailabilityChecker {
  constructor(private readonly logger: ILogger) {}

  async checkAndCategorize(
    items: MediaItemVO[],
    config: JellyseerrConfig
  ): Promise<CategorizedMediaItems> {
    const result: CategorizedMediaItems = {
      toBeRequested: [],
      previouslyRequested: [],
      available: [],
    };

    if (items.length === 0) {
      return result;
    }

    this.logger.info({ totalItems: items.length }, 'Starting media availability check');

    // Transform config entity to DTO for external client
    const configDTO = {
      id: config.id,
      userId: config.userId,
      url: config.url.getValue(),
      apiKey: config.apiKey.getValue(),
      userIdJellyseerr: config.userIdJellyseerr.getValue(),
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };

    // Process in chunks with concurrency control
    for (let i = 0; i < items.length; i += CONCURRENCY_LIMIT) {
      const chunk = items.slice(i, i + CONCURRENCY_LIMIT);

      // Check availability for chunk in parallel
      const checkPromises = chunk.map((item) => this.checkSingleItem(item, configDTO));
      const chunkResults = await Promise.allSettled(checkPromises);

      // Categorize results
      for (let j = 0; j < chunkResults.length; j++) {
        const settledResult = chunkResults[j];
        const item = chunk[j];

        if (settledResult.status === 'fulfilled') {
          const availability = settledResult.value;

          if (availability.isToBeRequested()) {
            result.toBeRequested.push(item);
          } else if (availability.isPreviouslyRequested()) {
            result.previouslyRequested.push(item);
          } else {
            result.available.push(item);
          }
        } else {
          // On error, default to TO_BE_REQUESTED (safer to try than skip)
          const errorMsg =
            settledResult.reason instanceof Error
              ? settledResult.reason.message
              : String(settledResult.reason);
          this.logger.warn(
            { tmdbId: item.tmdbId, error: errorMsg },
            'Availability check failed, treating as TO_BE_REQUESTED'
          );
          result.toBeRequested.push(item);
        }
      }

      // Log progress for large batches
      if (items.length > CONCURRENCY_LIMIT) {
        const processed = Math.min(i + CONCURRENCY_LIMIT, items.length);
        this.logger.debug({ processed, total: items.length }, 'Availability check progress');
      }
    }

    this.logger.info(
      {
        total: items.length,
        toBeRequested: result.toBeRequested.length,
        previouslyRequested: result.previouslyRequested.length,
        available: result.available.length,
      },
      'Media availability check completed'
    );

    return result;
  }

  /**
   * Check availability for a single media item
   */
  private async checkSingleItem(
    item: MediaItemVO,
    configDTO: {
      id: number;
      userId: number;
      url: string;
      apiKey: string;
      userIdJellyseerr: number;
      createdAt: Date;
      updatedAt: Date;
    }
  ): Promise<MediaAvailabilityVO> {
    const response = await getMediaAvailability(item.tmdbId, item.mediaType, configDTO);

    // Extract status from response (null if not found or no mediaInfo)
    const status = response?.mediaInfo?.status ?? null;

    return MediaAvailabilityVO.fromJellyseerrStatus(status);
  }
}
