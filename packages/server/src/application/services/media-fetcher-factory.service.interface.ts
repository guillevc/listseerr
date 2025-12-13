import type { Provider } from 'shared/domain/value-objects/provider.value-object';
import type { IMediaFetcher } from './media-fetcher.service.interface';

/**
 * Media Fetcher Factory Service Interface (Port)
 *
 * Creates media fetchers on-demand with current credentials.
 * Ensures fetchers always use the latest provider configuration.
 */
export interface IMediaFetcherFactory {
  /**
   * Create a media fetcher for the given provider
   *
   * @param provider - The provider type to create a fetcher for
   * @param userId - User ID to load provider configuration for
   * @returns Media fetcher instance or null if provider not configured
   */
  createFetcher(provider: Provider, userId: number): Promise<IMediaFetcher | null>;
}
