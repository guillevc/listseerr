import type { IMediaFetcherFactory } from '@/server/application/services/media-fetcher-factory.service.interface';
import type { IMediaFetcher } from '@/server/application/services/media-fetcher.service.interface';
import type { ITraktConfigRepository } from '@/server/application/repositories/trakt-config.repository.interface';
import type { IMdbListConfigRepository } from '@/server/application/repositories/mdblist-config.repository.interface';
import type { ProviderVO } from 'shared/domain/value-objects/provider.vo';
import { TraktMediaFetcher } from './trakt-media-fetcher.adapter';
import { MdbListMediaFetcher } from './mdblist-media-fetcher.adapter';
import { StevenLuMediaFetcher } from './stevenlu-media-fetcher.adapter';

export class MediaFetcherFactory implements IMediaFetcherFactory {
  constructor(
    private readonly traktConfigRepository: ITraktConfigRepository,
    private readonly mdbListConfigRepository: IMdbListConfigRepository
  ) {}

  async createFetcher(provider: ProviderVO, userId: number): Promise<IMediaFetcher | null> {
    if (provider.isStevenLu()) {
      return new StevenLuMediaFetcher();
    }

    if (provider.isTrakt() || provider.isTraktChart()) {
      const traktConfig = await this.traktConfigRepository.findByUserId(userId);
      if (!traktConfig) return null;
      return new TraktMediaFetcher(traktConfig.clientId);
    }

    if (provider.isMdbList()) {
      const mdbListConfig = await this.mdbListConfigRepository.findByUserId(userId);
      if (!mdbListConfig) return null;
      return new MdbListMediaFetcher(mdbListConfig.apiKey);
    }

    return null;
  }
}
