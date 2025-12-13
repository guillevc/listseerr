import { MediaItem } from 'shared/domain/value-objects/media-item.value-object';
import { MediaType } from 'shared/domain/value-objects/media-type.value-object';
import type { MdbListApiKey } from 'shared/domain/value-objects/mdblist-api-key.value-object';
import type { IMediaFetcher } from '@/server/application/services/media-fetcher.service.interface';
import { fetchMdbListList } from '@/server/infrastructure/services/external/mdblist/client';

/**
 * MDBList Media Fetcher Adapter
 *
 * Adapts existing MDBList client function to IMediaFetcher interface.
 */
export class MdbListMediaFetcher implements IMediaFetcher {
  constructor(private readonly apiKey: MdbListApiKey) {}

  async fetchItems(url: string, maxItems: number): Promise<MediaItem[]> {
    const apiKeyValue = this.apiKey.getValue();
    const rawItems = await fetchMdbListList(url, maxItems, apiKeyValue);

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
