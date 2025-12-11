import type { MediaListDTO, MediaListWithLastProcessedDTO } from '../core/media-list.dto';
import type { Nullable } from '../../../domain/types/utility.types';

/**
 * Response DTOs (Output)
 *
 * These represent the output data from use cases.
 * They contain only primitives - Value Objects are unwrapped to their raw values.
 * This makes them serializable and framework-agnostic.
 */

export interface CreateMediaListResponse {
  list: MediaListDTO;
}

export interface GetMediaListByIdResponse {
  list: Nullable<MediaListDTO>;
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
