import type { Nullable } from '../../../shared/types';
import type { ProviderConfigDTO } from '../../domain/entities/provider-config.entity';

/**
 * Response DTOs (Output)
 *
 * These represent the output data from each use case.
 * They contain only primitives - no Value Objects or Entities.
 */

export interface GetProviderConfigResponse {
  config: Nullable<ProviderConfigDTO>;
}

export interface UpdateProviderConfigResponse {
  config: ProviderConfigDTO;
}

export interface DeleteProviderConfigResponse {
  success: boolean;
}
