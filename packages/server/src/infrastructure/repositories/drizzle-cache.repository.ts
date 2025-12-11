import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import * as schema from '../../db/schema';
import { listItemsCache } from '../../db/schema';
import { MediaItem } from 'shared/domain/value-objects/media-item.value-object';
import type { ICacheRepository } from '../../application/repositories/cache.repository.interface';

export class DrizzleCacheRepository implements ICacheRepository {
  constructor(private readonly db: BunSQLiteDatabase<typeof schema>) {}

  async getRequestedTmdbIds(): Promise<Set<number>> {
    const rows = await this.db
      .select({ tmdbId: listItemsCache.tmdbId })
      .from(listItemsCache);

    return new Set(rows.map(row => row.tmdbId).filter((id): id is number => id !== null));
  }

  async filterAlreadyCached(items: MediaItem[]): Promise<MediaItem[]> {
    const cachedIds = await this.getRequestedTmdbIds();
    return items.filter(item => !cachedIds.has(item.tmdbId));
  }

  async cacheItems(listId: number, items: MediaItem[]): Promise<void> {
    if (items.length === 0) return;

    await this.db
      .insert(listItemsCache)
      .values(
        items.map(item => ({
          listId,
          title: item.title,
          year: item.year,
          tmdbId: item.tmdbId,
          mediaType: item.mediaType.getValue(),
          fetchedAt: new Date(),
        }))
      )
      .onConflictDoNothing(); // Unique constraint on tmdbId - global deduplication
  }
}
