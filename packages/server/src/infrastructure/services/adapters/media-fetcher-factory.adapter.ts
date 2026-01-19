import type { IMediaFetcherFactory } from '@/server/application/services/media-fetcher-factory.service.interface';
import type { IMediaFetcher } from '@/server/application/services/media-fetcher.service.interface';
import type { ITraktConfigRepository } from '@/server/application/repositories/trakt-config.repository.interface';
import type { IMdbListConfigRepository } from '@/server/application/repositories/mdblist-config.repository.interface';
import type { IAnimeIdCache } from '@/server/infrastructure/services/external/anime-id-cache/types';
import type { ProviderVO } from '@/server/domain/value-objects/provider.vo';
import { ProviderValues } from 'shared/domain/types';
import { TraktMediaFetcher } from './trakt-media-fetcher.adapter';
import { MdbListMediaFetcher } from './mdblist-media-fetcher.adapter';
import { StevenLuMediaFetcher } from './stevenlu-media-fetcher.adapter';
import { AnilistMediaFetcher } from './anilist-media-fetcher.adapter';

/**
 * Fetcher creator function type for the registry pattern.
 * Allows async creation with user-specific configuration.
 */
type FetcherCreator = (userId: number) => Promise<IMediaFetcher | null>;

/**
 * MediaFetcherFactory using registry pattern for OCP compliance.
 * Adding new providers no longer requires modifying createFetcher().
 */
export class MediaFetcherFactory implements IMediaFetcherFactory {
  private readonly fetcherRegistry = new Map<string, FetcherCreator>();

  constructor(
    private readonly traktConfigRepository: ITraktConfigRepository,
    private readonly mdbListConfigRepository: IMdbListConfigRepository,
    private readonly animeIdCache: IAnimeIdCache
  ) {
    this.registerDefaultFetchers();
  }

  /**
   * Register default fetchers for built-in providers.
   * New providers can be registered via registerFetcher().
   */
  private registerDefaultFetchers(): void {
    // StevenLu: No auth required
    this.fetcherRegistry.set(ProviderValues.STEVENLU, () =>
      Promise.resolve(new StevenLuMediaFetcher())
    );

    // Trakt: Requires client ID from config
    const traktCreator: FetcherCreator = async (userId) => {
      const config = await this.traktConfigRepository.findByUserId(userId);
      if (!config) return null;
      return new TraktMediaFetcher(config.clientId);
    };
    this.fetcherRegistry.set(ProviderValues.TRAKT, traktCreator);
    this.fetcherRegistry.set(ProviderValues.TRAKT_CHART, traktCreator);

    // MDBList: Requires API key from config
    this.fetcherRegistry.set(ProviderValues.MDBLIST, async (userId) => {
      const config = await this.mdbListConfigRepository.findByUserId(userId);
      if (!config) return null;
      return new MdbListMediaFetcher(config.apiKey);
    });

    // AniList: Public API, no auth required
    this.fetcherRegistry.set(ProviderValues.ANILIST, () =>
      Promise.resolve(new AnilistMediaFetcher(this.animeIdCache))
    );
  }

  async createFetcher(provider: ProviderVO, userId: number): Promise<IMediaFetcher | null> {
    const creator = this.fetcherRegistry.get(provider.getValue());
    if (!creator) {
      return null;
    }
    return creator(userId);
  }
}
