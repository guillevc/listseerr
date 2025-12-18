import { MediaItemVO } from '@/server/domain/value-objects/media-item.vo';
import { MediaTypeVO } from '@/server/domain/value-objects/media-type.vo';
import type { MdbListApiKeyVO } from '@/server/domain/value-objects/mdblist-api-key.vo';
import type { IMediaFetcher } from '@/server/application/services/media-fetcher.service.interface';
import { fetchMdbListList } from '@/server/infrastructure/services/external/mdblist/client';

/**
 * MDBList Media Fetcher Adapter
 *
 * Adapts existing MDBList client function to IMediaFetcher interface.
 */
export class MdbListMediaFetcher implements IMediaFetcher {
  constructor(private readonly apiKey: MdbListApiKeyVO) {}

  async fetchItems(url: string, maxItems: number): Promise<MediaItemVO[]> {
    const apiKeyValue = this.apiKey.getValue();
    const rawItems = await fetchMdbListList(url, maxItems, apiKeyValue);

    // Transform raw items to domain MediaItem value objects
    return rawItems.map((item) =>
      MediaItemVO.create({
        title: item.title,
        year: item.year,
        tmdbId: item.tmdbId,
        mediaType: MediaTypeVO.create(item.mediaType),
      })
    );
  }
}
