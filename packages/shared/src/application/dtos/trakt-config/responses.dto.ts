import type { TraktConfigDTO } from '../core/trakt-config.dto';

/**
 * Trakt Config Response DTOs
 */

export interface TraktConfigResponse {
  config: TraktConfigDTO;
}

export interface GetTraktConfigResponse {
  config: TraktConfigDTO | null;
}

export interface DeleteTraktConfigResponse {
  success: boolean;
}
