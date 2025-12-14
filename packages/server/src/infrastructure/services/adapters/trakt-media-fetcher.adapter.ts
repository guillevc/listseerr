import { MediaItemVO } from 'shared/domain/value-objects/media-item.vo';
import { MediaTypeVO } from 'shared/domain/value-objects/media-type.vo';
import type { TraktClientIdVO } from 'shared/domain/value-objects/trakt-client-id.vo';
import type { IMediaFetcher } from '@/server/application/services/media-fetcher.service.interface';
import { fetchTraktList } from '@/server/infrastructure/services/external/trakt/client';
import { fetchTraktChart } from '@/server/infrastructure/services/external/trakt/chart-client';

/**
 * Trakt Media Fetcher Adapter
 *
 * Adapts existing Trakt client functions to IMediaFetcher interface.
 * Supports both 'trakt' (lists) and 'traktChart' (charts) provider types.
 */
export class TraktMediaFetcher implements IMediaFetcher {
  constructor(private readonly clientId: TraktClientIdVO) {}

  async fetchItems(url: string, maxItems: number): Promise<MediaItemVO[]> {
    const clientIdValue = this.clientId.getValue();

    // Determine which client to use based on URL pattern
    const isList = url.includes('/lists/');
    const rawItems = isList
      ? await fetchTraktList(url, maxItems, clientIdValue)
      : await fetchTraktChart(url, maxItems, clientIdValue);

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
