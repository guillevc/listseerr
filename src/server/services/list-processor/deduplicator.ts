import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { listItemsCache } from '../../db/schema';
import type { MediaItem } from '../trakt/types';
import { createLogger } from '../../lib/logger';
import * as schema from '../../db/schema';

const logger = createLogger('deduplicator');

export async function getAlreadyRequestedIds(
  db: BunSQLiteDatabase<typeof schema>,
  listId: number
): Promise<Set<number>> {
  try {
    logger.debug({ listId }, 'Fetching already requested IDs from global cache');

    // Query ALL cached items across all lists (global cache)
    const cached = await db
      .select({ tmdbId: listItemsCache.tmdbId })
      .from(listItemsCache);

    // Filter out null values and return as Set
    const ids = cached
      .map((item) => item.tmdbId)
      .filter((id): id is number => id !== null);

    logger.debug(
      {
        listId,
        globalCachedCount: ids.length,
      },
      'Retrieved globally cached IDs'
    );

    return new Set(ids);
  } catch (error) {
    logger.error(
      {
        listId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error fetching already requested IDs'
    );
    return new Set();
  }
}

export async function cacheRequestedItems(
  db: BunSQLiteDatabase<typeof schema>,
  listId: number,
  items: MediaItem[]
): Promise<void> {
  if (items.length === 0) {
    logger.debug({ listId }, 'No items to cache');
    return;
  }

  try {
    logger.debug(
      {
        listId,
        itemsToCache: items.length,
      },
      'Caching successfully requested items to global cache'
    );

    // Insert items into global cache
    // listId is stored for tracking which list first requested the item
    // tmdbId is unique, so onConflictDoNothing prevents duplicates across all lists
    for (const item of items) {
      await db
        .insert(listItemsCache)
        .values({
          listId,
          title: item.title,
          year: item.year,
          tmdbId: item.tmdbId,
          mediaType: item.mediaType === 'tv' ? 'tv' : 'movie',
          fetchedAt: new Date(),
        })
        .onConflictDoNothing();
    }

    logger.info(
      {
        listId,
        cachedCount: items.length,
      },
      'Successfully cached requested items to global cache'
    );
  } catch (error) {
    logger.error(
      {
        listId,
        itemCount: items.length,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error caching requested items'
    );
    throw new Error('Failed to cache requested items');
  }
}
