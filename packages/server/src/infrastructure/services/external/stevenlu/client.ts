import { createLogger } from '../../logger.service';
import { db } from '../../../db/client';
import { providerCache } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import type { StevenLuItem, MediaItem } from './types';
import { ProviderValues } from 'shared/domain/types/provider.types';

const logger = createLogger('stevenlu-client');

// StevenLu constants
const STEVENLU_API_URL = 'https://s3.amazonaws.com/popular-movies/movies.json';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Fetch the StevenLu popular movies list with 24-hour caching
 *
 * @param maxItems - Maximum number of items to return (takes first N items)
 * @returns Array of MediaItem objects
 */
export async function fetchStevenLuList(maxItems: number | null): Promise<MediaItem[]> {
  try {
    logger.info({ maxItems }, 'Fetching StevenLu popular movies list');

    // Check cache first
    const [cachedData] = await db
      .select()
      .from(providerCache)
      .where(eq(providerCache.provider, ProviderValues.STEVENLU))
      .limit(1);

    const now = new Date();
    let items: StevenLuItem[] = [];

    // Check if cache exists and is still valid (< 24 hours old)
    if (cachedData) {
      const cacheAge = now.getTime() - cachedData.cachedAt.getTime();

      if (cacheAge < CACHE_DURATION_MS) {
        logger.info(
          {
            cacheAge: Math.floor(cacheAge / 1000 / 60), // minutes
            cacheExpiresIn: Math.floor((CACHE_DURATION_MS - cacheAge) / 1000 / 60), // minutes
          },
          'Using cached StevenLu data'
        );
        items = JSON.parse(cachedData.data);
      } else {
        logger.info(
          { cacheAge: Math.floor(cacheAge / 1000 / 60) },
          'Cache expired, fetching fresh data'
        );
      }
    } else {
      logger.info('No cache found, fetching fresh data');
    }

    // Fetch fresh data if cache is invalid or doesn't exist
    if (items.length === 0) {
      logger.info({ apiUrl: STEVENLU_API_URL }, 'Fetching from StevenLu API');

      const response = await fetch(STEVENLU_API_URL, {
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
            url: STEVENLU_API_URL,
            responseBody: errorBody,
          },
          'StevenLu API request failed'
        );
        throw new Error(`StevenLu API error: ${response.statusText}`);
      }

      items = (await response.json()) as StevenLuItem[];
      logger.info({ count: items.length }, 'Received items from StevenLu API');

      // Update cache
      const dataJson = JSON.stringify(items);

      if (cachedData) {
        // Update existing cache
        await db
          .update(providerCache)
          .set({
            data: dataJson,
            cachedAt: now,
          })
          .where(eq(providerCache.provider, ProviderValues.STEVENLU));

        logger.info('Updated StevenLu cache');
      } else {
        // Insert new cache entry
        await db.insert(providerCache).values({
          provider: ProviderValues.STEVENLU,
          data: dataJson,
          cachedAt: now,
        });

        logger.info('Created StevenLu cache');
      }
    }

    // Apply maxItems limit if specified (take first N items)
    let limitedItems = items;
    if (maxItems && maxItems > 0) {
      limitedItems = items.slice(0, maxItems);
      logger.info(
        {
          totalItems: items.length,
          requestedMax: maxItems,
          returnedItems: limitedItems.length,
        },
        'Applied maxItems limit'
      );
    }

    // Transform to MediaItem format
    const mediaItems = limitedItems
      .map(transformStevenLuItem)
      .filter((item): item is MediaItem => item !== null);

    logger.info(
      {
        total: limitedItems.length,
        withTmdbId: mediaItems.length,
      },
      'Transformed StevenLu items'
    );

    return mediaItems;
  } catch (error) {
    logger.error({ error }, 'Error fetching StevenLu list');
    throw error;
  }
}

function transformStevenLuItem(item: StevenLuItem): MediaItem | null {
  // Skip items without TMDB ID (required for Jellyseerr)
  if (!item.tmdb_id) {
    return null;
  }

  return {
    title: item.title,
    year: null, // StevenLu doesn't provide year information
    tmdbId: item.tmdb_id,
    mediaType: 'movie', // All items in StevenLu list are movies
  };
}
