import { MediaItem } from '../../domain/value-objects/media-item.value-object';
import { MediaType } from '../../domain/value-objects/media-type.value-object';
import { ProviderNotConfiguredError } from '../../domain/errors/processing.errors';
import type { IMediaFetcher } from '../../application/services/media-fetcher.service.interface';
import type { ProviderType } from '../../domain/value-objects/provider-type.value-object';
import type { ProviderConfigData } from '../../domain/types/provider-config.types';
import { fetchMdbListList } from '../../services/mdblist/client';

/**
 * MDBList Media Fetcher Adapter
 *
 * Adapts existing MDBList client function to IMediaFetcher interface.
 */
export class MdbListMediaFetcher implements IMediaFetcher {
  supports(providerType: ProviderType): boolean {
    return providerType.isMdbList();
  }

  async fetchItems(
    url: string,
    maxItems: number,
    providerConfig: ProviderConfigData
  ): Promise<MediaItem[]> {
    // Validate config has apiKey (MDBList-specific)
    if (!('apiKey' in providerConfig)) {
      throw new ProviderNotConfiguredError('MDBList');
    }

    const apiKey = providerConfig.apiKey.getValue();
    const rawItems = await fetchMdbListList(url, maxItems, apiKey);

    // Transform raw items to domain MediaItem value objects
    return rawItems.map(item =>
      MediaItem.create({
        title: item.title,
        year: item.year,
        tmdbId: item.tmdbId,
        mediaType: MediaType.fromString(item.mediaType),
      })
    );
  }
}
