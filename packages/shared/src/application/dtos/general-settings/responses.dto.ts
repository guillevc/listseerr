import type { Nullable } from '../../../domain/types/utility.types';
import type { GeneralSettingsDTO } from '../core/general-settings.dto';

/**
 * General Settings Response DTOs
 *
 * Output contracts for general settings use cases.
 * Contains only primitives - no Value Objects or Entities.
 */

export interface GetGeneralSettingsResponse {
  settings: Nullable<GeneralSettingsDTO>;
}

export interface UpdateGeneralSettingsResponse {
  settings: GeneralSettingsDTO;
}
