import type { GeneralSettingsDTO } from '../core/general-settings.dto';

/**
 * General Settings Response DTOs
 *
 * Output contracts for general settings use cases.
 * Contains only primitives - no Value Objects or Entities.
 */

export interface GetGeneralSettingsResponse {
  settings: GeneralSettingsDTO | null;
}

export interface UpdateGeneralSettingsResponse {
  settings: GeneralSettingsDTO;
}
