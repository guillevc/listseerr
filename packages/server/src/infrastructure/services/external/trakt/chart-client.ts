import { TraktChartTypeVO } from '@/server/domain/value-objects/trakt-chart-type.vo';
import { TraktMediaTypeVO } from '@/server/domain/value-objects/trakt-media-type.vo';
import type { MediaItemDTO } from 'shared/application/dtos/core/media-item.dto';
import { LoggerService } from '@/server/infrastructure/services/core/logger.adapter';

const logger = new LoggerService('trakt-chart-client');

// Simple chart response - movie/show data at root level
interface TraktSimpleChartItem {
  title: string;
  year: number;
  ids: {
    tmdb: number;
  };
}

// Wrapped chart response - movie/show nested with additional metadata
interface TraktWrappedChartItem {
  watcher_count?: number;
  play_count?: number;
  collected_count?: number;
  movie?: {
    title: string;
    year: number;
    ids: {
      tmdb: number;
    };
  };
  show?: {
    title: string;
    year: number;
    ids: {
      tmdb: number;
    };
  };
}

/**
 * Parse a Trakt chart URL (display or API) to extract media type and chart type
 * Examples:
 *   - https://trakt.tv/movies/trending -> { mediaType: TraktMediaTypeVO, chartType: TraktChartTypeVO }
 *   - https://api.trakt.tv/movies/trending -> { mediaType: TraktMediaTypeVO, chartType: TraktChartTypeVO }
 */
export function parseTraktChartUrl(url: string): {
  mediaType: TraktMediaTypeVO;
  chartType: TraktChartTypeVO;
} {
  // Accept both display URLs (trakt.tv) and API URLs (api.trakt.tv)
  const urlPattern =
    /^https?:\/\/(www\.)?(api\.)?trakt\.tv\/(movies|shows)\/(trending|popular|favorited|played|watched|collected|anticipated)\/?$/i;
  const match = url.match(urlPattern);

  if (!match) {
    throw new Error(`Invalid Trakt chart URL: ${url}`);
  }

  const mediaTypeStr = match[3].toLowerCase();
  const chartTypeStr = match[4].toLowerCase();

  // Validate using VOs - fromPersistence validates untrusted string input
  const mediaType = TraktMediaTypeVO.fromPersistence(mediaTypeStr);
  const chartType = TraktChartTypeVO.fromPersistence(chartTypeStr);

  return { mediaType, chartType };
}

/**
 * Convert a Trakt chart display URL to an API URL
 * Example: https://trakt.tv/movies/trending -> https://api.trakt.tv/movies/trending
 */
export function convertDisplayUrlToApiUrl(displayUrl: string): string {
  const { mediaType, chartType } = parseTraktChartUrl(displayUrl);
  return `https://api.trakt.tv/${mediaType.getValue()}/${chartType.getValue()}`;
}

/**
 * Build Trakt API URL for chart endpoint
 * Example: buildTraktChartApiUrl(mediaTypeVO, chartTypeVO, 1, 20)
 *   -> https://api.trakt.tv/movies/trending?page=1&limit=20
 */
export function buildTraktChartApiUrl(
  mediaType: TraktMediaTypeVO,
  chartType: TraktChartTypeVO,
  page: number = 1,
  limit?: number
): string {
  let apiUrl = `https://api.trakt.tv/${mediaType.getValue()}/${chartType.getValue()}?page=${page}`;

  if (limit) {
    apiUrl += `&limit=${limit}`;
  }

  return apiUrl;
}

/**
 * Fetch and transform items from a Trakt chart
 * Main entry point for chart fetching - matches signature of fetchTraktList
 */
export async function fetchTraktChart(
  url: string,
  maxItems: number | null,
  clientId: string
): Promise<MediaItemDTO[]> {
  try {
    // Parse the Trakt chart URL
    const { mediaType, chartType } = parseTraktChartUrl(url);
    logger.debug(
      { url, mediaType: mediaType.getValue(), chartType: chartType.getValue() },
      'Parsed Trakt chart URL'
    );

    // Build the API URL with pagination
    const limit = maxItems || 100;
    const apiUrl = buildTraktChartApiUrl(mediaType, chartType, 1, limit);

    logger.debug({ apiUrl, limit }, 'Fetching items from Trakt chart API');

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
        'Trakt chart API request failed'
      );
      throw new Error(`Trakt API error: ${response.status} ${response.statusText}`);
    }

    // Determine if this is a wrapped or simple chart type
    const isWrappedChart = chartType.isWrappedChartType();

    const rawItems = (await response.json()) as (TraktSimpleChartItem | TraktWrappedChartItem)[];

    logger.debug(
      {
        totalItems: rawItems.length,
        mediaType: mediaType.getValue(),
        chartType: chartType.getValue(),
        isWrappedChart,
      },
      'Received items from Trakt chart API'
    );

    // Transform chart items to MediaItemDTO format
    const mediaItems: MediaItemDTO[] = rawItems
      .map((item) =>
        isWrappedChart
          ? transformWrappedChartItem(item as TraktWrappedChartItem, mediaType)
          : transformSimpleChartItem(item as TraktSimpleChartItem, mediaType)
      )
      .filter((item): item is MediaItemDTO => item !== null);

    const skippedCount = rawItems.length - mediaItems.length;

    logger.debug(
      {
        validItems: mediaItems.length,
        skippedItems: skippedCount,
      },
      'Transformed Trakt chart items to MediaItem format'
    );

    if (skippedCount > 0) {
      logger.warn({ skippedCount }, 'Some items were skipped due to missing TMDB IDs');
    }

    return mediaItems;
  } catch (error) {
    logger.error({ error, url }, 'Failed to fetch Trakt chart');
    if (error instanceof Error) {
      throw new Error(`Failed to fetch Trakt chart: ${error.message}`);
    }
    throw new Error('Failed to fetch Trakt chart: Unknown error');
  }
}

/**
 * Transform a simple Trakt chart item to MediaItem format
 * Simple charts (trending, popular, anticipated) return movie/show at root level
 */
function transformSimpleChartItem(
  item: TraktSimpleChartItem,
  mediaType: TraktMediaTypeVO
): MediaItemDTO | null {
  const tmdbId = item.ids.tmdb;

  if (!tmdbId) {
    logger.debug(
      { title: item.title, year: item.year, mediaType: mediaType.getValue() },
      'Skipping item - no TMDB ID'
    );
    return null;
  }

  // Map mediaType from URL format to our MediaType format
  // 'movies' -> 'movie', 'shows' -> 'tv'
  const mappedMediaType = mediaType.isMovies() ? 'movie' : ('tv' as const);

  return {
    title: item.title,
    year: item.year,
    tmdbId,
    mediaType: mappedMediaType,
  };
}

/**
 * Transform a wrapped Trakt chart item to MediaItem format
 * Wrapped charts (collected, played, watched, favorited) nest movie/show in object
 */
function transformWrappedChartItem(
  item: TraktWrappedChartItem,
  mediaType: TraktMediaTypeVO
): MediaItemDTO | null {
  // Extract the movie or show data from the wrapper
  const content = mediaType.isMovies() ? item.movie : item.show;

  if (!content) {
    logger.debug(
      { mediaType: mediaType.getValue(), itemKeys: Object.keys(item) },
      'Skipping item - no movie/show data found'
    );
    return null;
  }

  const tmdbId = content.ids.tmdb;

  if (!tmdbId) {
    logger.debug(
      { title: content.title, year: content.year, mediaType: mediaType.getValue() },
      'Skipping item - no TMDB ID'
    );
    return null;
  }

  // Map mediaType from URL format to our MediaType format
  // 'movies' -> 'movie', 'shows' -> 'tv'
  const mappedMediaType = mediaType.isMovies() ? 'movie' : ('tv' as const);

  return {
    title: content.title,
    year: content.year,
    tmdbId,
    mediaType: mappedMediaType,
  };
}
