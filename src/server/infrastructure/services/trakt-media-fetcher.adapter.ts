import { MediaItem } from '../../domain/value-objects/media-item.value-object';
import { MediaType } from '../../domain/value-objects/media-type.value-object';
import { ProviderNotConfiguredError } from '../../domain/errors/processing.errors';
import type { IMediaFetcher } from '../../application/services/media-fetcher.service.interface';
import type { ProviderType } from '../../domain/value-objects/provider-type.value-object';
import type { ProviderConfigData } from '../../domain/types/provider-config.types';
import { fetchTraktList } from '../../services/trakt/client';
import { fetchTraktChart } from '../../services/trakt/chart-client';

/**
 * Trakt Media Fetcher Adapter
 *
 * Adapts existing Trakt client functions to IMediaFetcher interface.
 * Supports both 'trakt' (lists) and 'traktChart' (charts) provider types.
 */
export class TraktMediaFetcher implements IMediaFetcher {
  supports(providerType: ProviderType): boolean {
    return providerType.isTrakt() || providerType.isTraktChart();
  }

  async fetchItems(
    url: string,
    maxItems: number,
    providerConfig: ProviderConfigData
  ): Promise<MediaItem[]> {
    // Validate config has clientId (Trakt-specific)
    if (!('clientId' in providerConfig)) {
      throw new ProviderNotConfiguredError('Trakt');
    }

    const clientId = providerConfig.clientId.getValue();

    // Determine which client to use based on URL pattern
    const isList = url.includes('/lists/');
    const rawItems = isList
      ? await fetchTraktList(url, maxItems, clientId)
      : await fetchTraktChart(url, maxItems, clientId);

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
