import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq } from 'drizzle-orm';
import { listItemsCache } from '../../db/schema';
import type { MediaItem } from '../trakt/types';
import { createLogger } from '../../lib/logger';

const logger = createLogger('deduplicator');

export async function getAlreadyRequestedIds(
  db: BunSQLiteDatabase<Record<string, never>>,
  listId: number
): Promise<Set<number>> {
  try {
    logger.debug({ listId }, 'Fetching already requested IDs from cache');

    const cached = await db
      .select({ tmdbId: listItemsCache.tmdbId })
      .from(listItemsCache)
      .where(eq(listItemsCache.listId, listId));

    // Filter out null values and return as Set
    const ids = cached
      .map((item) => item.tmdbId)
      .filter((id): id is number => id !== null);

    logger.debug(
      {
        listId,
        cachedCount: ids.length,
      },
      'Retrieved cached IDs'
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
  db: BunSQLiteDatabase<Record<string, never>>,
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
      'Caching successfully requested items'
    );

    // Insert items into cache
    // Using INSERT OR IGNORE to handle duplicates gracefully
    for (const item of items) {
      await db
        .insert(listItemsCache)
        .values({
          listId,
          title: item.title,
          year: item.year,
          tmdbId: item.tmdbId,
          imdbId: item.imdbId,
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
      'Successfully cached requested items'
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
