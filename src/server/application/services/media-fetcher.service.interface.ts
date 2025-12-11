import type { MediaItem } from '../../../shared/domain/value-objects/media-item.value-object';
import type { Provider } from '../../../shared/domain/value-objects/provider.value-object';
import type { ProviderConfigData } from '../../domain/types/provider-config.types';

/**
 * Media Fetcher Service Interface (Port)
 *
 * Abstraction for fetching media items from external providers.
 * Uses Strategy Pattern - each implementation supports specific provider types.
 */
export interface IMediaFetcher {
  /**
   * Check if this fetcher supports the given provider type
   */
  supports(provider: Provider): boolean;

  /**
   * Fetch media items from external provider
   *
   * @param url - Provider-specific URL (list URL, chart URL, etc.)
   * @param maxItems - Maximum number of items to fetch
   * @param providerConfig - API credentials (Trakt clientId or MDBList apiKey)
   * @returns Array of media items
   * @throws ProviderNotConfiguredError if required credentials are missing
   */
  fetchItems(
    url: string,
    maxItems: number,
    providerConfig: ProviderConfigData
  ): Promise<MediaItem[]>;
}
