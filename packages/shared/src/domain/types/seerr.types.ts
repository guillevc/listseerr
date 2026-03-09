/**
 * Seerr Types
 *
 * Pure TypeScript contracts for Seerr-related data.
 * Schemas must satisfy these types.
 */

export type SeerrUrlPrimitive = string;
export type SeerrExternalUrlPrimitive = string;
export type SeerrApiKeyPrimitive = string;
export type SeerrUserIdPrimitive = number;
export type TvSeasonsPrimitive = 'first' | 'all';

export interface SeerrConfigPrimitive {
  url: SeerrUrlPrimitive;
  externalUrl?: SeerrExternalUrlPrimitive;
  apiKey: SeerrApiKeyPrimitive;
  userIdSeerr: SeerrUserIdPrimitive;
  tvSeasons: TvSeasonsPrimitive;
}
