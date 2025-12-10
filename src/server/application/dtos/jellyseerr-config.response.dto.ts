import type { Nullable } from '../../../shared/types';
import type { JellyseerrConfigDTO } from '../../domain/entities/jellyseerr-config.entity';

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
