/**
 * Anime ID Cache Client
 *
 * Fetches and caches anime ID mappings from Fribb/anime-lists on GitHub.
 * Provides O(1) lookups from AniList/MAL IDs to TMDB IDs.
 * Uses the providerCache table with 24-hour TTL.
 */

import { LoggerService } from '@/server/infrastructure/services/core/logger.adapter';
import { db } from '@/server/infrastructure/db/client';
import { providerCache } from '@/server/infrastructure/db/schema';
import { eq } from 'drizzle-orm';
import type { AnimeIdEntry, IAnimeIdCache, TmdbLookupResult } from './types';

const logger = new LoggerService('anime-id-cache');

// Fribb anime-lists constants
const ANIME_LISTS_URL =
  'https://raw.githubusercontent.com/Fribb/anime-lists/master/anime-list-full.json';
const CACHE_PROVIDER_KEY = 'anime-ids';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const REQUEST_TIMEOUT_MS = 60000; // 60 seconds timeout for large file download
const MAX_INIT_ATTEMPTS = 3; // Maximum initialization retry attempts

/**
 * Maps Fribb type values to media types
 */
function mapTypeToMediaType(type?: string): string {
  if (!type) return 'tv'; // Default to TV if unknown

  const normalizedType = type.toUpperCase();

  // Movie types
  if (normalizedType === 'MOVIE') {
    return 'movie';
  }

  // TV types (TV, OVA, ONA, Special, TV_SHORT)
  return 'tv';
}

class AnimeIdCache implements IAnimeIdCache {
  private anilistToTmdb = new Map<number, TmdbLookupResult>();
  private malToTmdb = new Map<number, TmdbLookupResult>();
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  private initAttempts = 0;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Prevent concurrent initialization
    if (this.initPromise) {
      return this.initPromise;
    }

    // Check if max attempts exceeded
    if (this.initAttempts >= MAX_INIT_ATTEMPTS) {
      throw new Error(
        `Anime ID cache initialization failed after ${MAX_INIT_ATTEMPTS} attempts. ` +
          'Please check network connectivity and try again later.'
      );
    }

    this.initAttempts++;
    this.initPromise = this.loadCache();

    try {
      await this.initPromise;
    } catch (error) {
      this.initPromise = null;
      throw error;
    }
  }

  private async loadCache(): Promise<void> {
    try {
      logger.info('Loading anime ID cache');

      // Check database cache first
      const [cachedData] = await db
        .select()
        .from(providerCache)
        .where(eq(providerCache.provider, CACHE_PROVIDER_KEY))
        .limit(1);

      const now = new Date();
      let entries: AnimeIdEntry[] = [];

      // Check if cache exists and is still valid (< 24 hours old)
      if (cachedData) {
        const cacheAge = now.getTime() - cachedData.cachedAt.getTime();

        if (cacheAge < CACHE_DURATION_MS) {
          logger.debug(
            {
              cacheAge: Math.floor(cacheAge / 1000 / 60), // minutes
              cacheExpiresIn: Math.floor((CACHE_DURATION_MS - cacheAge) / 1000 / 60), // minutes
            },
            'Using cached anime ID data'
          );
          entries = JSON.parse(cachedData.data) as AnimeIdEntry[];
        } else {
          logger.info(
            { cacheAge: Math.floor(cacheAge / 1000 / 60) },
            'Cache expired, fetching fresh anime ID data'
          );
        }
      } else {
        logger.info('No anime ID cache found, fetching fresh data');
      }

      // Fetch fresh data if cache is invalid or doesn't exist
      if (entries.length === 0) {
        entries = await this.fetchFromRemote();

        // Update database cache
        const dataJson = JSON.stringify(entries);

        if (cachedData) {
          await db
            .update(providerCache)
            .set({
              data: dataJson,
              cachedAt: now,
            })
            .where(eq(providerCache.provider, CACHE_PROVIDER_KEY));

          logger.info('Updated anime ID cache in database');
        } else {
          await db.insert(providerCache).values({
            provider: CACHE_PROVIDER_KEY,
            data: dataJson,
            cachedAt: now,
          });

          logger.info('Created anime ID cache in database');
        }
      }

      // Build in-memory lookup maps
      this.buildLookupMaps(entries);
      this.initialized = true;
      this.initAttempts = 0; // Reset attempts on success
      this.initPromise = null;

      logger.info(
        {
          anilistMappings: this.anilistToTmdb.size,
          malMappings: this.malToTmdb.size,
        },
        'Anime ID cache initialized'
      );
    } catch (error) {
      logger.error({ error }, 'Failed to load anime ID cache');
      throw error;
    }
  }

  private async fetchFromRemote(): Promise<AnimeIdEntry[]> {
    logger.info({ url: ANIME_LISTS_URL }, 'Fetching anime ID mappings from Fribb');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(ANIME_LISTS_URL, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        logger.error(
          {
            status: response.status,
            statusText: response.statusText,
            url: ANIME_LISTS_URL,
            responseBody: errorBody.substring(0, 500),
          },
          'Failed to fetch anime ID mappings'
        );
        throw new Error(`Fribb API error: ${response.statusText}`);
      }

      const entries = (await response.json()) as AnimeIdEntry[];
      logger.info({ count: entries.length }, 'Received anime ID entries from Fribb');

      return entries;
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildLookupMaps(entries: AnimeIdEntry[]): void {
    this.anilistToTmdb.clear();
    this.malToTmdb.clear();

    for (const entry of entries) {
      // Only add mappings where TMDB ID exists
      if (entry.themoviedb_id) {
        const result: TmdbLookupResult = {
          tmdbId: entry.themoviedb_id,
          type: mapTypeToMediaType(entry.type),
        };

        if (entry.anilist_id) {
          this.anilistToTmdb.set(entry.anilist_id, result);
        }

        if (entry.mal_id) {
          this.malToTmdb.set(entry.mal_id, result);
        }
      }
    }
  }

  getTmdbIdFromAnilist(anilistId: number): TmdbLookupResult | null {
    if (!this.initialized) {
      logger.warn('Anime ID cache not initialized, call initialize() first');
      return null;
    }
    return this.anilistToTmdb.get(anilistId) ?? null;
  }

  getTmdbIdFromMal(malId: number): TmdbLookupResult | null {
    if (!this.initialized) {
      logger.warn('Anime ID cache not initialized, call initialize() first');
      return null;
    }
    return this.malToTmdb.get(malId) ?? null;
  }

  async refreshCache(): Promise<void> {
    logger.info('Force refreshing anime ID cache');
    this.initialized = false;
    this.initAttempts = 0; // Reset attempts for deliberate refresh
    this.initPromise = null;
    this.anilistToTmdb.clear();
    this.malToTmdb.clear();

    // Delete existing cache to force fresh fetch
    await db.delete(providerCache).where(eq(providerCache.provider, CACHE_PROVIDER_KEY));

    await this.initialize();
  }
}

// Export singleton instance
export const animeIdCache = new AnimeIdCache();
