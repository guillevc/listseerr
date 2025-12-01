export type ListProvider = 'trakt' | 'letterboxd' | 'mdblist' | 'imdb' | 'tmdb';

export interface MediaList {
  id: string;
  name: string;
  url: string;
  provider: ListProvider;
  enabled: boolean;
  maxItems?: number;
  lastSync?: Date;
  lastSyncStatus?: 'success' | 'error' | 'syncing';
  lastSyncError?: string;
  itemCount?: number;
}

export interface JellyseerrConfig {
  url: string;
  apiKey: string;
  userId: number;
}

export interface MediaItem {
  title: string;
  year?: number;
  tmdbId?: number;
  imdbId?: string;
  mediaType: 'movie' | 'tv';
}

export interface SyncStatus {
  listId: string;
  status: 'idle' | 'syncing' | 'success' | 'error';
  message?: string;
  lastSync?: Date;
}
