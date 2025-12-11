import { createLogger } from '../../lib/logger';
import { parseMdbListUrl, buildMdbListApiUrl } from './url-parser';
import type { MdbListApiItem, MediaItem } from './types';

const logger = createLogger('mdblist-client');

export async function fetchMdbListList(
  url: string,
  maxItems: number | null,
  apiKey: string
): Promise<MediaItem[]> {
  try {
    // Parse the MDBList URL
    const urlParts = parseMdbListUrl(url);
    logger.info({ urlParts }, 'Parsed MDBList URL');

    // Determine limit
    const limit = maxItems ? Math.min(maxItems, 50) : 50;  // Max 50 per API docs

    // Build API URL
    const apiUrl = buildMdbListApiUrl(urlParts, limit, apiKey);
    logger.info({ apiUrl: apiUrl.replace(apiKey, 'REDACTED') }, 'Fetching from MDBList API');

    // Fetch from MDBList API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error(
        {
          status: response.status,
          statusText: response.statusText,
          url: apiUrl.replace(apiKey, 'REDACTED'),
          responseBody: errorBody,
        },
        'MDBList API request failed'
      );
      throw new Error(`MDBList API error: ${response.statusText}`);
    }

    const data = await response.json() as MdbListApiItem[];
    logger.info({ count: data.length }, 'Received items from MDBList');

    // Transform to MediaItem format
    const mediaItems = data
      .map(transformMdbListItem)
      .filter((item): item is MediaItem => item !== null);

    logger.info({
      total: data.length,
      withTmdbId: mediaItems.length
    }, 'Transformed MDBList items');

    return mediaItems;
  } catch (error) {
    logger.error({ error, url }, 'Error fetching MDBList list');
    throw error;
  }
}

function transformMdbListItem(item: MdbListApiItem): MediaItem | null {
  // Skip items without TMDB ID (required for Jellyseerr)
  if (!item.id) {
    return null;
  }

  return {
    title: item.title,
    year: item.release_year || null,
    tmdbId: item.id,  // MDBList 'id' field is TMDB ID
    mediaType: item.mediatype === 'show' ? 'tv' : 'movie',  // Convert 'show' to 'tv'
  };
}
