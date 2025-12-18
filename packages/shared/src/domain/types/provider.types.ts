/**
 * Provider Types
 *
 * Pure TypeScript contract for provider-related data.
 * Schemas must satisfy these types.
 */

export const ProviderValues = {
  TRAKT: 'trakt',
  MDBLIST: 'mdblist',
  TRAKT_CHART: 'traktChart',
  STEVENLU: 'stevenlu',
} as const;

export type ProviderType = (typeof ProviderValues)[keyof typeof ProviderValues];

export const ProviderUrlPatterns: Record<ProviderType, RegExp[]> = {
  trakt: [/^https?:\/\/(www\.)?trakt\.tv\/users\/[^/]+\/lists\/[^/]+\/?/i],
  traktChart: [
    /^https?:\/\/(www\.)?trakt\.tv\/(movies|shows)\/(trending|popular|favorited|played|watched|collected|anticipated)\/?$/i,
  ],
  mdblist: [/^https?:\/\/(www\.)?mdblist\.com\/lists\/[^/]+\/[^/]+\/?/i],
  stevenlu: [/^https?:\/\/movies\.stevenlu\.com\/?$/i],
};

export const ProviderDisplayNames: Record<ProviderType, string> = {
  trakt: 'Trakt List',
  traktChart: 'Trakt Chart',
  mdblist: 'MDBList',
  stevenlu: 'StevenLu',
};
