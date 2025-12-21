import type { MdbListConfigDTO } from '../core/mdblist-config.dto';

/**
 * MdbList Config Response DTOs
 */

export interface MdbListConfigResponse {
  config: MdbListConfigDTO;
}

export interface GetMdbListConfigResponse {
  config: MdbListConfigDTO | null;
}

export interface DeleteMdbListConfigResponse {
  success: boolean;
}
