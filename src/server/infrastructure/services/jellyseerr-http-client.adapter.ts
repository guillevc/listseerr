import { MediaItem } from '../../domain/value-objects/media-item.value-object';
import type { IJellyseerrClient, ProcessingResult } from '../../application/services/jellyseerr-client.service.interface';
import type { JellyseerrConfig } from '../../domain/entities/jellyseerr-config.entity';
import { requestItemsToJellyseerr } from '../../services/jellyseerr/client';

/**
 * Jellyseerr HTTP Client Adapter
 *
 * Adapts existing Jellyseerr client function to IJellyseerrClient interface.
 * Delegates to infrastructure service while working with domain types.
 */
export class JellyseerrHttpClient implements IJellyseerrClient {
  async requestItems(
    items: MediaItem[],
    config: JellyseerrConfig
  ): Promise<ProcessingResult> {
    // Transform domain MediaItem VOs to DTOs for infrastructure layer
    const itemDTOs = items.map(item => item.toDTO());

    // Transform JellyseerrConfig entity to database schema format
    // The existing infrastructure function expects the full database row type
    const configDTO = {
      id: config.id,
      userId: config.userId,
      url: config.url.getValue(),
      apiKey: config.apiKey.getValue(),
      userIdJellyseerr: config.userIdJellyseerr.getValue(),
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    };

    // Delegate to existing infrastructure service
    const result = await requestItemsToJellyseerr(itemDTOs, configDTO);

    // Transform result DTOs back to domain MediaItem VOs
    return {
      successful: result.successful.map(dto =>
        MediaItem.create({
          title: dto.title,
          year: dto.year,
          tmdbId: dto.tmdbId,
          mediaType: dto.mediaType === 'movie'
            ? require('../../domain/value-objects/media-type.value-object').MediaType.movie()
            : require('../../domain/value-objects/media-type.value-object').MediaType.tv(),
        })
      ),
      failed: result.failed.map(failure => ({
        item: MediaItem.create({
          title: failure.item.title,
          year: failure.item.year,
          tmdbId: failure.item.tmdbId,
          mediaType: failure.item.mediaType === 'movie'
            ? require('../../domain/value-objects/media-type.value-object').MediaType.movie()
            : require('../../domain/value-objects/media-type.value-object').MediaType.tv(),
        }),
        error: failure.error,
      })),
    };
  }
}
