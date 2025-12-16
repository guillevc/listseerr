import type { JellyseerrConfigDTO } from '../core/jellyseerr-config.dto';

/**
 * Response DTOs (Output)
 *
 * These represent the output data from each use case.
 * They contain only primitives - no Value Objects or Entities.
 */

export interface GetJellyseerrConfigResponse {
  config: JellyseerrConfigDTO | null;
}

export interface UpdateJellyseerrConfigResponse {
  config: JellyseerrConfigDTO;
}

export interface DeleteJellyseerrConfigResponse {
  success: boolean;
}
