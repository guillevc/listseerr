import type { ProviderType } from '../../domain/types/media-list.types';

/**
 * Response DTOs (Output)
 *
 * These represent the output data from use cases.
 * They contain only primitives - Value Objects are unwrapped to their raw values.
 * This makes them serializable and framework-agnostic.
 */

/**
 * Core MediaList DTO - contains unwrapped primitives
 * Used as the base for all list-related responses
 */
export interface MediaListDTO {
  id: number;
  userId: number;
  name: string;              // Unwrapped from ListName VO
  url: string;               // Unwrapped from ListUrl VO
  displayUrl: string;
  provider: ProviderType;    // Unwrapped from Provider VO
  enabled: boolean;
  maxItems: number;
  processingSchedule?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Extended MediaList DTO with last processed timestamp
 * Used for list views that show processing history
 */
export interface MediaListWithLastProcessedDTO extends MediaListDTO {
  lastProcessed: Date | null;
}

// Use Case Response Interfaces

export interface CreateMediaListResponse {
  list: MediaListDTO;
}

export interface GetMediaListByIdResponse {
  list: MediaListDTO | null;
}

export interface GetAllMediaListsResponse {
  lists: MediaListWithLastProcessedDTO[];
}

export interface UpdateMediaListResponse {
  list: MediaListDTO;
}

export interface ToggleListEnabledResponse {
  list: MediaListDTO;
}

export interface DeleteMediaListResponse {
  success: boolean;
}

export interface EnableAllListsResponse {
  success: boolean;
}
