import type { MediaItem } from 'shared/domain/value-objects/media-item.value-object';

/**
 * Media Fetcher Service Interface (Port)
 *
 * Abstraction for fetching media items from external providers.
 * Each implementation is constructed with its required credentials.
 */
export interface IMediaFetcher {
  /**
   * Fetch media items from external provider
   *
   * @param url - Provider-specific URL (list URL, chart URL, etc.)
   * @param maxItems - Maximum number of items to fetch
   * @returns Array of media items
   */
  fetchItems(url: string, maxItems: number): Promise<MediaItem[]>;
}
