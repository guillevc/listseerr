import { MediaItem } from 'shared/domain/value-objects/media-item.value-object';
import { MediaType } from 'shared/domain/value-objects/media-type.value-object';
import { ProviderNotConfiguredError } from 'shared/domain/errors/processing.errors';
import type { IMediaFetcher } from '../../../application/services/media-fetcher.service.interface';
import type { Provider } from 'shared/domain/value-objects/provider.value-object';
import type { ProviderConfigData } from '../../../domain/types/provider-config.types';
import { fetchMdbListList } from '../external/mdblist/client';

/**
 * MDBList Media Fetcher Adapter
 *
 * Adapts existing MDBList client function to IMediaFetcher interface.
 */
export class MdbListMediaFetcher implements IMediaFetcher {
  supports(provider: Provider): boolean {
    return provider.isMdbList();
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
    return rawItems.map((item) =>
      MediaItem.create({
        title: item.title,
        year: item.year,
        tmdbId: item.tmdbId,
        mediaType: MediaType.create(item.mediaType),
      })
    );
  }
}
