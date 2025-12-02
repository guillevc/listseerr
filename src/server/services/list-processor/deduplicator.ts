import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { eq } from 'drizzle-orm';
import { listItemsCache } from '../../db/schema';
import type { MediaItem } from '../trakt/types';

export async function getAlreadyRequestedIds(
  db: BunSQLiteDatabase<Record<string, never>>,
  listId: number
): Promise<Set<number>> {
  try {
    const cached = await db
      .select({ tmdbId: listItemsCache.tmdbId })
      .from(listItemsCache)
      .where(eq(listItemsCache.listId, listId));

    // Filter out null values and return as Set
    const ids = cached
      .map((item) => item.tmdbId)
      .filter((id): id is number => id !== null);

    return new Set(ids);
  } catch (error) {
    console.error('Error fetching already requested IDs:', error);
    return new Set();
  }
}

export async function cacheRequestedItems(
  db: BunSQLiteDatabase<Record<string, never>>,
  listId: number,
  items: MediaItem[]
): Promise<void> {
  if (items.length === 0) {
    return;
  }

  try {
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

    console.log(`Cached ${items.length} successfully requested items`);
  } catch (error) {
    console.error('Error caching requested items:', error);
    throw new Error('Failed to cache requested items');
  }
}
