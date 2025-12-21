/**
 * Trakt Chart URL Logic Functions
 *
 * Centralized URL parsing for Trakt chart URLs.
 * Pattern is built dynamically from type constants.
 * Shared between frontend and server (DRY principle).
 */

import {
  TraktChartTypeValues,
  TraktMediaTypeValues,
  type TraktChartType,
  type TraktMediaType,
} from '../types/trakt.types';

// Build pattern dynamically from constants with named capture groups
const chartTypes = Object.values(TraktChartTypeValues).join('|');
const mediaTypes = Object.values(TraktMediaTypeValues).join('|');

/**
 * Regex pattern for Trakt chart URLs (display or API).
 * Matches: https://trakt.tv/movies/trending, https://api.trakt.tv/shows/popular, etc.
 */
export const TRAKT_CHART_URL_PATTERN = new RegExp(
  `^https?://(?:www\\.)?(?:api\\.)?trakt\\.tv/(?<mediaType>${mediaTypes})/(?<chartType>${chartTypes})/?$`,
  'i'
);

export interface ParsedTraktChartUrl {
  mediaType: TraktMediaType;
  chartType: TraktChartType;
}

/**
 * Parses a Trakt chart URL to extract media type and chart type.
 * Returns null if the URL doesn't match the expected pattern.
 *
 * @example
 * parseTraktChartUrl('https://trakt.tv/movies/trending')
 * // Returns: { mediaType: 'movies', chartType: 'trending' }
 */
export function parseTraktChartUrl(url: string): ParsedTraktChartUrl | null {
  const match = url.match(TRAKT_CHART_URL_PATTERN);
  if (!match?.groups) return null;

  return {
    mediaType: match.groups.mediaType.toLowerCase() as TraktMediaType,
    chartType: match.groups.chartType.toLowerCase() as TraktChartType,
  };
}
