/**
 * Trakt Types
 *
 * Pure TypeScript contracts for Trakt-related data.
 * Schemas must satisfy these types.
 */

export type TraktClientIdPrimitive = string;

export const TraktChartTypeValues = {
  TRENDING: 'trending',
  POPULAR: 'popular',
  FAVORITED: 'favorited',
  PLAYED: 'played',
  WATCHED: 'watched',
  COLLECTED: 'collected',
  ANTICIPATED: 'anticipated',
} as const;

export type TraktChartType = (typeof TraktChartTypeValues)[keyof typeof TraktChartTypeValues];

export const TraktMediaTypeValues = {
  MOVIES: 'movies',
  SHOWS: 'shows',
} as const;

export type TraktMediaType = (typeof TraktMediaTypeValues)[keyof typeof TraktMediaTypeValues];

export interface TraktConfigPrimitive {
  clientId: TraktClientIdPrimitive;
}
