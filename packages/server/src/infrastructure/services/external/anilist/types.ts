/**
 * AniList API Types
 *
 * Types for the AniList GraphQL API responses.
 * API documentation: https://anilist.gitbook.io/anilist-apiv2-docs/
 */

import type { AnilistStatus } from 'shared/presentation/schemas';

/**
 * Title object from AniList media.
 */
export interface AnilistMediaTitle {
  romaji: string;
  english: string | null;
}

/**
 * Media object from AniList.
 */
export interface AnilistMedia {
  id: number;
  title: AnilistMediaTitle;
  format: string | null; // TV, MOVIE, OVA, ONA, SPECIAL, TV_SHORT, MUSIC, etc.
  episodes: number | null;
  seasonYear: number | null;
}

/**
 * Single entry in a media list from AniList.
 */
export interface AnilistMediaEntry {
  mediaId: number;
  score: number;
  status: AnilistStatus;
  media: AnilistMedia;
}

/**
 * A single list within a MediaListCollection.
 */
export interface AnilistMediaList {
  name: string;
  status: AnilistStatus;
  entries: AnilistMediaEntry[];
}

/**
 * The MediaListCollection from AniList GraphQL API.
 */
export interface AnilistMediaListCollection {
  lists: AnilistMediaList[];
}

/**
 * GraphQL response wrapper for MediaListCollection query.
 */
export interface AnilistGraphQLResponse {
  data: {
    MediaListCollection: AnilistMediaListCollection | null;
  } | null;
  errors?: AnilistGraphQLError[];
}

/**
 * GraphQL error from AniList.
 */
export interface AnilistGraphQLError {
  message: string;
  status?: number;
  locations?: Array<{ line: number; column: number }>;
}

/**
 * Parsed result from AniList URL.
 */
export interface AnilistUrlParsed {
  username: string;
  status: AnilistStatus;
}
