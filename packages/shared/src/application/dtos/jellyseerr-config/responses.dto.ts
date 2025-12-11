import type { Nullable } from '@/shared/domain/types/utility.types';
import type { JellyseerrConfigDTO } from '../core/jellyseerr-config.dto';

/**
 * Response DTOs (Output)
 *
 * These represent the output data from each use case.
 * They contain only primitives - no Value Objects or Entities.
 */

export interface GetJellyseerrConfigResponse {
  config: Nullable<JellyseerrConfigDTO>;
}

export interface UpdateJellyseerrConfigResponse {
  config: JellyseerrConfigDTO;
}

export interface DeleteJellyseerrConfigResponse {
  success: boolean;
}
