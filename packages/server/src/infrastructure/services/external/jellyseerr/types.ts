import type { MediaType } from 'shared/domain/value-objects/media-type.vo';
import type { MediaItemDTO } from 'shared/application/dtos/core/media-item.dto';

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
