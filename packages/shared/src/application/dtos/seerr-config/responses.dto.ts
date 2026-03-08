import type { SeerrConfigDTO } from '../core/seerr-config.dto';

/**
 * Response DTOs (Output)
 *
 * These represent the output data from each use case.
 * They contain only primitives - no Value Objects or Entities.
 */

export interface GetSeerrConfigResponse {
  config: SeerrConfigDTO | null;
}

export interface UpdateSeerrConfigResponse {
  config: SeerrConfigDTO;
}

export interface DeleteSeerrConfigResponse {
  success: boolean;
}
