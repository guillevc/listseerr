import type { MediaItemVO } from '@/server/domain/value-objects/media-item.vo';
import type {
  IJellyseerrClient,
  ProcessingResult,
} from '@/server/application/services/jellyseerr-client.service.interface';
import type { JellyseerrConfig } from '@/server/domain/entities/jellyseerr-config.entity';
import { requestItemsToJellyseerr } from '@/server/infrastructure/services/external/jellyseerr/client';
import { JellyseerrConfigMapper } from '@/server/application/mappers/jellyseerr-config.mapper';
import { MediaItemMapper } from '@/server/application/mappers/media-item.mapper';

/**
 * Jellyseerr HTTP Client Adapter
 *
 * Adapts existing Jellyseerr client function to IJellyseerrClient interface.
 * Delegates to infrastructure service while working with domain types.
 */
export class JellyseerrHttpClient implements IJellyseerrClient {
  async requestItems(items: MediaItemVO[], config: JellyseerrConfig): Promise<ProcessingResult> {
    const itemDTOs = items.map((item) => MediaItemMapper.toDTO(item));
    const configDTO = JellyseerrConfigMapper.toDTO(config);

    const result = await requestItemsToJellyseerr(itemDTOs, configDTO);

    return {
      successful: result.successful.map((dto) => MediaItemMapper.toVO(dto)),
      failed: result.failed.map((failure) => ({
        item: MediaItemMapper.toVO(failure.item),
        error: failure.error,
      })),
    };
  }
}
