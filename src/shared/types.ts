/**
 * Shared types used across client and server
 * Following DRY principle to avoid duplication
 */

// ============================================
// Utility Types
// ============================================

/**
 * Nullable utility type - represents a value that can be null
 * Use this instead of `T | null` for consistency
 */
export type Nullable<T> = T | null;

// ============================================
// Provider & Media Types
// ============================================

export type Provider = 'trakt' | 'mdblist' | 'traktChart' | 'stevenlu';
export type ListProvider = 'trakt' | 'mdblist' | 'traktChart' | 'letterboxd' | 'imdb' | 'stevenlu';
export type MediaType = 'movie' | 'tv';
export type TraktChartType = 'trending' | 'popular' | 'favorited' | 'played' | 'watched' | 'collected' | 'anticipated';
export type TraktMediaType = 'movies' | 'shows';

// ============================================
// Processing Types
// ============================================

export type ProcessingStatus = 'running' | 'success' | 'error';
export type TriggerType = 'manual' | 'scheduled';

// ============================================
// Serialized Types (for tRPC responses)
// ============================================

/**
 * MediaList as received from tRPC (dates serialized to strings)
 */
export interface SerializedMediaList {
  id: number;
  name: string;
  createdAt: Nullable<string>;
  userId: number;
  url: string;
  displayUrl: Nullable<string>;
  updatedAt: Nullable<string>;
  provider: Provider;
  enabled: boolean;
  maxItems: Nullable<number>;
  processingSchedule: Nullable<string>;
  lastProcessed: Nullable<string>;
  [key: string]: unknown;
}

// ============================================
// Media Item
// ============================================

export interface MediaItem {
  title: string;
  year: Nullable<number>;
  tmdbId: number;
  mediaType: MediaType;
}

// ============================================
// Processing Result
// ============================================

export interface ProcessingResult {
  success: boolean;
  itemsFound: number;
  itemsRequested: number;
  itemsFailed: number;
}
