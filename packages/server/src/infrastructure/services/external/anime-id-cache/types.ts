/**
 * Anime ID Cache Types
 *
 * Types for the anime ID mapping cache that converts between different
 * anime database IDs (AniList, MAL, TMDB, TVDB).
 * Data sourced from Fribb/anime-lists on GitHub.
 */

/**
 * Single entry from the Fribb anime-lists JSON.
 * All IDs are optional as not all anime have mappings to all databases.
 */
export interface AnimeIdEntry {
  mal_id?: number;
  anilist_id?: number;
  themoviedb_id?: number;
  thetvdb_id?: number;
  type?: string; // 'TV', 'Movie', 'OVA', 'ONA', 'Special', etc.
}

/**
 * Result of a TMDB ID lookup from the cache.
 */
export interface TmdbLookupResult {
  tmdbId: number;
  type: string; // 'tv' or 'movie'
}

/**
 * Interface for the anime ID cache service.
 * Provides O(1) lookups from AniList/MAL IDs to TMDB IDs.
 */
export interface IAnimeIdCache {
  /**
   * Gets the TMDB ID and media type for a given AniList ID.
   * Returns null if no mapping exists.
   */
  getTmdbIdFromAnilist(anilistId: number): TmdbLookupResult | null;

  /**
   * Gets the TMDB ID and media type for a given MAL ID.
   * Returns null if no mapping exists.
   */
  getTmdbIdFromMal(malId: number): TmdbLookupResult | null;

  /**
   * Forces a refresh of the cache from the remote source.
   * Use sparingly - the cache has a 24-hour TTL.
   */
  refreshCache(): Promise<void>;

  /**
   * Initializes the cache if not already loaded.
   * Call this before first use to ensure data is available.
   */
  initialize(): Promise<void>;
}
