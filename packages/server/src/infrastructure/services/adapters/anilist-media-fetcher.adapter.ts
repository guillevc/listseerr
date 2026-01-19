/**
 * AniList Media Fetcher Adapter
 *
 * Adapts AniList client to IMediaFetcher interface.
 * AniList is a public API (no auth required for public lists).
 * Uses anime ID cache for AniList ID to TMDB ID conversion.
 */

import { MediaItemVO } from '@/server/domain/value-objects/media-item.vo';
import { MediaTypeVO } from '@/server/domain/value-objects/media-type.vo';
import type { IMediaFetcher } from '@/server/application/services/media-fetcher.service.interface';
import {
  fetchAnilistList,
  parseAnilistUrl,
} from '@/server/infrastructure/services/external/anilist/client';
import type { IAnimeIdCache } from '@/server/infrastructure/services/external/anime-id-cache/types';
import type { AnilistMediaEntry } from '@/server/infrastructure/services/external/anilist/types';
import { LoggerService } from '@/server/infrastructure/services/core/logger.adapter';

const logger = new LoggerService('anilist-media-fetcher');

/**
 * AniList format values that map to TV
 */
const TV_FORMATS = new Set(['TV', 'OVA', 'ONA', 'SPECIAL', 'TV_SHORT']);

/**
 * AniList format values that map to Movie
 */
const MOVIE_FORMATS = new Set(['MOVIE']);

/**
 * AniList format values to skip (not requestable in Jellyseerr)
 */
const SKIP_FORMATS = new Set(['MUSIC']);

/**
 * Maps AniList format to media type.
 * Returns null for formats that should be skipped.
 */
function mapFormatToMediaType(format: string | null): 'tv' | 'movie' | null {
  if (!format) {
    // Default to TV if format is unknown
    return 'tv';
  }

  const normalizedFormat = format.toUpperCase();

  if (SKIP_FORMATS.has(normalizedFormat)) {
    return null;
  }

  if (MOVIE_FORMATS.has(normalizedFormat)) {
    return 'movie';
  }

  if (TV_FORMATS.has(normalizedFormat)) {
    return 'tv';
  }

  // Default to TV for unknown formats
  return 'tv';
}

export class AnilistMediaFetcher implements IMediaFetcher {
  constructor(private readonly animeIdCache: IAnimeIdCache) {}

  async fetchItems(url: string, maxItems: number): Promise<MediaItemVO[]> {
    // Parse the AniList URL (format: anilist:{username}:{status})
    const parsed = parseAnilistUrl(url);

    if (!parsed) {
      logger.error({ url }, 'Failed to parse AniList URL');
      throw new Error(`Invalid AniList URL format: ${url}`);
    }

    const { username, status } = parsed;

    // Ensure anime ID cache is initialized
    await this.animeIdCache.initialize();

    // Fetch from AniList API
    const entries = await fetchAnilistList(username, status, maxItems);

    logger.info({ username, status, entriesCount: entries.length }, 'Processing AniList entries');

    // Transform to MediaItemVO, filtering out items without TMDB mapping
    const mediaItems: MediaItemVO[] = [];
    let skippedNoTmdb = 0;
    let skippedFormat = 0;

    for (const entry of entries) {
      const result = this.transformEntry(entry);

      if (result === null) {
        // Check if skipped due to format or TMDB
        const mediaType = mapFormatToMediaType(entry.media.format);
        if (mediaType === null) {
          skippedFormat++;
        } else {
          skippedNoTmdb++;
        }
      } else {
        mediaItems.push(result);
      }
    }

    logger.info(
      {
        username,
        status,
        total: entries.length,
        converted: mediaItems.length,
        skippedNoTmdb,
        skippedFormat,
      },
      'Transformed AniList entries to media items'
    );

    return mediaItems;
  }

  private transformEntry(entry: AnilistMediaEntry): MediaItemVO | null {
    const { media } = entry;

    // Check if format should be skipped
    const mediaTypeValue = mapFormatToMediaType(media.format);
    if (mediaTypeValue === null) {
      logger.debug(
        { anilistId: media.id, format: media.format, title: media.title.romaji },
        'Skipping entry with non-requestable format'
      );
      return null;
    }

    // Look up TMDB ID from cache
    const tmdbResult = this.animeIdCache.getTmdbIdFromAnilist(media.id);

    if (!tmdbResult) {
      logger.debug(
        { anilistId: media.id, title: media.title.romaji },
        'No TMDB mapping found for AniList entry'
      );
      return null;
    }

    // Use title: prefer English, fall back to Romaji
    const title = media.title.english ?? media.title.romaji;

    // Use media type from cache (more accurate) or fall back to format-based
    const finalMediaType = tmdbResult.type === 'movie' ? 'movie' : 'tv';

    return MediaItemVO.create({
      title,
      year: media.seasonYear,
      tmdbId: tmdbResult.tmdbId,
      mediaType: finalMediaType === 'movie' ? MediaTypeVO.movie() : MediaTypeVO.tv(),
    });
  }
}
