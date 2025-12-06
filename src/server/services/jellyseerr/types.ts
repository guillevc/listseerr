import type { MediaItem } from '../trakt/types';

export interface JellyseerrRequestPayload {
  mediaType: 'movie' | 'tv';
  mediaId: number;
  seasons?: number[];
}

export interface JellyseerrRequestResponse {
  id: number;
  status: number;
  media: {
    id: number;
    tmdbId: number;
    mediaType: string;
  };
}

export interface ProcessingResult {
  successful: MediaItem[];
  failed: Array<{
    item: MediaItem;
    error: string;
  }>;
}

export interface JellyseerrPendingRequestsResponse {
  pageInfo: {
    pages: number;
    pageSize: number;
    results: number;
    page: number;
  };
  results: unknown[]; // We don't need the actual request data
}
