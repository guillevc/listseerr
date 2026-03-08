import type { MediaItemVO } from '@/server/domain/value-objects/media-item.vo';
import type {
  ISeerrClient,
  ProcessingResult,
} from '@/server/application/services/seerr-client.service.interface';
import type { SeerrConfig } from '@/server/domain/entities/seerr-config.entity';
import { requestItemsToSeerr } from '@/server/infrastructure/services/external/seerr/client';
import { SeerrConfigMapper } from '@/server/application/mappers/seerr-config.mapper';
import { MediaItemMapper } from '@/server/application/mappers/media-item.mapper';

/**
 * Seerr HTTP Client Adapter
 *
 * Adapts existing Seerr client function to ISeerrClient interface.
 * Delegates to infrastructure service while working with domain types.
 */
export class SeerrHttpClient implements ISeerrClient {
  async requestItems(items: MediaItemVO[], config: SeerrConfig): Promise<ProcessingResult> {
    const itemDTOs = items.map((item) => MediaItemMapper.toDTO(item));
    const configDTO = SeerrConfigMapper.toDTO(config);

    // Convert DTO (with undefined) to schema format (with null)
    const configForClient = {
      ...configDTO,
      externalUrl: configDTO.externalUrl ?? null,
    };

    const result = await requestItemsToSeerr(itemDTOs, configForClient);

    return {
      successful: result.successful.map((dto) => MediaItemMapper.toVO(dto)),
      failed: result.failed.map((failure) => ({
        item: MediaItemMapper.toVO(failure.item),
        error: failure.error,
      })),
    };
  }
}
