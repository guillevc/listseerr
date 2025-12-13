import type { IMediaFetcherFactory } from '@/server/application/services/media-fetcher-factory.service.interface';
import type { IMediaFetcher } from '@/server/application/services/media-fetcher.service.interface';
import type { IProviderConfigRepository } from '@/server/application/repositories/provider-config.repository.interface';
import type { Provider } from 'shared/domain/value-objects/provider.value-object';
import type {
  TraktConfigData,
  MdbListConfigData,
} from '@/server/domain/types/provider-config.types';
import { TraktMediaFetcher } from './trakt-media-fetcher.adapter';
import { MdbListMediaFetcher } from './mdblist-media-fetcher.adapter';
import { StevenLuMediaFetcher } from './stevenlu-media-fetcher.adapter';

/**
 * Media Fetcher Factory Adapter
 *
 * Creates media fetchers on-demand with current credentials from the database.
 * Ensures fetchers always use the latest provider configuration.
 */
export class MediaFetcherFactory implements IMediaFetcherFactory {
  constructor(private readonly providerConfigRepository: IProviderConfigRepository) {}

  async createFetcher(provider: Provider, userId: number): Promise<IMediaFetcher | null> {
    // StevenLu doesn't require authentication
    if (provider.isStevenLu()) {
      return new StevenLuMediaFetcher();
    }

    // Load current config from database
    const providerConfig = await this.providerConfigRepository.findByUserIdAndProvider(
      userId,
      provider
    );

    if (!providerConfig) {
      return null;
    }

    // Create fetcher with current credentials
    if (provider.isTrakt() || provider.isTraktChart()) {
      const config = providerConfig.config as TraktConfigData;
      return new TraktMediaFetcher(config.clientId);
    }

    if (provider.isMdbList()) {
      const config = providerConfig.config as MdbListConfigData;
      return new MdbListMediaFetcher(config.apiKey);
    }

    return null;
  }
}
