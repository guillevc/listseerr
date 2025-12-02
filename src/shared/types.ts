export type ListProvider = 'trakt' | 'letterboxd' | 'mdblist' | 'imdb' | 'tmdb';

export interface MediaList {
  id: string;
  name: string;
  url: string;
  provider: ListProvider;
  enabled: boolean;
  maxItems?: number;
  lastProcessed?: Date;
  lastProcessedStatus?: 'success' | 'error' | 'processing';
  lastProcessedError?: string;
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

export interface ProcessingStatus {
  listId: string;
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
  lastProcessed?: Date;
}
