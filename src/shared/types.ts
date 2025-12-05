/**
 * Shared types used across client and server
 * Following DRY principle to avoid duplication
 */

// ============================================
// Provider & Media Types
// ============================================

export type Provider = 'trakt' | 'mdblist' | 'traktChart';
export type ListProvider = 'trakt' | 'mdblist' | 'traktChart' | 'letterboxd' | 'imdb';
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
  createdAt: string | null;
  userId: number;
  url: string;
  updatedAt: string | null;
  provider: Provider;
  enabled: boolean;
  maxItems: number | null;
  processingSchedule: string | null;
  lastProcessed: string | null;
  [key: string]: unknown;
}

// ============================================
// Media Item
// ============================================

export interface MediaItem {
  title: string;
  year: number | null;
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
