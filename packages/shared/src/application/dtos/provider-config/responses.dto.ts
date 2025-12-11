import type { Nullable } from '@/domain/types/utility.types';
import type { ProviderConfigDTO } from '../core/provider-config.dto';

/**
 * Provider Config Response DTOs
 *
 * Output contracts for provider configuration use cases.
 * Contains only primitives - no Value Objects or Entities.
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
