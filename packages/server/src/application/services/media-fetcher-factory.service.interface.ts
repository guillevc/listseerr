import type { ProviderVO } from '@/server/domain/value-objects/provider.vo';
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
  createFetcher(provider: ProviderVO, userId: number): Promise<IMediaFetcher | null>;
}
