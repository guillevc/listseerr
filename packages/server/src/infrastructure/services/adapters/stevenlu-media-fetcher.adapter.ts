import { MediaItem } from 'shared/domain/value-objects/media-item.value-object';
import { MediaType } from 'shared/domain/value-objects/media-type.value-object';
import type { IMediaFetcher } from '@/server/application/services/media-fetcher.service.interface';
import { fetchStevenLuList } from '@/server/infrastructure/services/external/stevenlu/client';

/**
 * StevenLu Media Fetcher Adapter
 *
 * Adapts existing StevenLu client function to IMediaFetcher interface.
 * StevenLu is a public API (no auth required) that returns popular movies.
 */
export class StevenLuMediaFetcher implements IMediaFetcher {
  async fetchItems(_url: string, maxItems: number): Promise<MediaItem[]> {
    // StevenLu doesn't require authentication or URL
    // _url parameter is ignored (API has no URL parameter)
    const rawItems = await fetchStevenLuList(maxItems);

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
