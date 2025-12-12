import { parseTraktUrl, buildTraktApiUrl } from './url-parser';
import type { TraktListItem, MediaItem } from './types';
import { LoggerService } from '@/server/infrastructure/services/core/logger.service';

const logger = new LoggerService('trakt-client');

export async function fetchTraktList(
  url: string,
  maxItems: number | null,
  clientId: string
): Promise<MediaItem[]> {
  try {
    // Parse the Trakt URL
    const urlParts = parseTraktUrl(url);
    logger.debug({ url, urlParts }, 'Parsed Trakt URL');

    // Build the API URL with pagination
    const limit = maxItems || 100;
    const apiUrl = buildTraktApiUrl(urlParts, 1, limit);

    logger.debug({ apiUrl, limit }, 'Fetching items from Trakt API');

    // Fetch from Trakt API
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Trakt-Api-Version': '2',
        'Trakt-Api-Key': clientId,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      logger.error(
        {
          status: response.status,
          statusText: response.statusText,
          url: apiUrl.replace(clientId, 'REDACTED'),
          responseBody: errorBody,
        },
        'Trakt API request failed'
      );
      throw new Error(`Trakt API error: ${response.status} ${response.statusText}`);
    }

    const items = (await response.json()) as TraktListItem[];

    logger.debug(
      {
        totalItems: items.length,
        itemTypes: items.reduce(
          (acc, item) => {
            acc[item.type] = (acc[item.type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
      'Received items from Trakt API'
    );

    // Transform Trakt items to MediaItem format
    const mediaItems: MediaItem[] = items
      .map((item) => transformTraktItem(item))
      .filter((item): item is MediaItem => item !== null);

    const skippedCount = items.length - mediaItems.length;

    logger.debug(
      {
        validItems: mediaItems.length,
        skippedItems: skippedCount,
        mediaTypes: mediaItems.reduce(
          (acc, item) => {
            acc[item.mediaType] = (acc[item.mediaType] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
      'Transformed Trakt items to MediaItem format'
    );

    if (skippedCount > 0) {
      logger.warn({ skippedCount }, 'Some items were skipped due to missing TMDB IDs');
    }

    return mediaItems;
  } catch (error) {
    logger.error({ error, url }, 'Failed to fetch Trakt list');
    if (error instanceof Error) {
      throw new Error(`Failed to fetch Trakt list: ${error.message}`);
    }
    throw new Error('Failed to fetch Trakt list: Unknown error');
  }
}

function transformTraktItem(item: TraktListItem): MediaItem | null {
  // Handle movie items
  if (item.type === 'movie' && item.movie) {
    const tmdbId = item.movie.ids.tmdb;
    if (!tmdbId) {
      logger.debug(
        { title: item.movie.title, year: item.movie.year },
        'Skipping movie - no TMDB ID'
      );
      return null;
    }

    return {
      title: item.movie.title,
      year: item.movie.year,
      tmdbId,
      mediaType: 'movie',
    };
  }

  // Handle show items
  if (item.type === 'show' && item.show) {
    const tmdbId = item.show.ids.tmdb;
    if (!tmdbId) {
      logger.debug({ title: item.show.title, year: item.show.year }, 'Skipping show - no TMDB ID');
      return null;
    }

    return {
      title: item.show.title,
      year: item.show.year,
      tmdbId,
      mediaType: 'tv',
    };
  }

  logger.debug({ type: item.type }, 'Skipping unknown item type');
  return null;
}
