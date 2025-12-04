/**
 * Shared types used across client and server
 * Following DRY principle to avoid duplication
 */

// ============================================
// Provider & Media Types
// ============================================

export type Provider = 'trakt' | 'mdblist';
export type MediaType = 'movie' | 'tv';

// ============================================
// Processing Types
// ============================================

export type ProcessingStatus = 'running' | 'success' | 'error';
export type TriggerType = 'manual' | 'scheduled';

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
