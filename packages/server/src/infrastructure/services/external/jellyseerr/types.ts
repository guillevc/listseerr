import type { MediaType } from '@/server/domain/value-objects/media-type.vo';
import type { MediaItemDTO } from 'shared/application/dtos';

export interface JellyseerrRequestPayload {
  mediaType: MediaType;
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
  successful: MediaItemDTO[];
  failed: Array<{
    item: MediaItemDTO;
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

/**
 * Response from GET /api/v1/movie/{id} or GET /api/v1/tv/{id}
 *
 * Contains mediaInfo with status indicating availability:
 * - 1 = UNKNOWN (not in Jellyseerr)
 * - 2 = PENDING (request pending approval)
 * - 3 = PROCESSING (request being processed)
 * - 4 = PARTIALLY_AVAILABLE (some content available)
 * - 5 = AVAILABLE (fully available)
 * - 6 = DELETED (was requested but deleted)
 * - >= 7 = UNDOCUMENTED_STATE (treat based on hasRequests)
 *
 * If mediaInfo is missing, the media is not in Jellyseerr.
 */
export interface JellyseerrMediaInfoResponse {
  id: number;
  tmdbId: number;
  title?: string;
  mediaInfo?: {
    id: number;
    status: number;
    status4k?: number; // 4K availability (same codes as status)
    requests?: unknown[]; // Only need to check if non-empty
  };
}
