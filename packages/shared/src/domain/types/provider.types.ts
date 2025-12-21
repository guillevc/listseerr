/**
 * Provider Types
 *
 * Pure TypeScript contract for provider-related data.
 * Schemas must satisfy these types.
 */

import { TRAKT_CHART_URL_PATTERN } from '../logic/trakt-chart-url.logic';
import { MDBLIST_URL_PATTERN } from '../logic/mdblist-url.logic';

export const ProviderValues = {
  TRAKT: 'trakt',
  MDBLIST: 'mdblist',
  TRAKT_CHART: 'traktChart',
  STEVENLU: 'stevenlu',
} as const;

export type ProviderType = (typeof ProviderValues)[keyof typeof ProviderValues];

export const ProviderUrlPatterns: Record<ProviderType, RegExp[]> = {
  trakt: [/^https?:\/\/(www\.)?trakt\.tv\/users\/[^/]+\/lists\/[^/]+\/?/i],
  traktChart: [TRAKT_CHART_URL_PATTERN],
  mdblist: [MDBLIST_URL_PATTERN],
  stevenlu: [/^https?:\/\/movies\.stevenlu\.com\/?$/i],
};
