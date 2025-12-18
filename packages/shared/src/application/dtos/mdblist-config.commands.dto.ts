import type { MdbListConfigDTO } from './core/mdblist-config.dto';
import type { MdblistApiKeyPrimitive } from '../../domain/types/mdblist.types';

/**
 * MdbList Config Command DTOs
 *
 * Pure TypeScript interfaces - no runtime validation.
 * Validation happens in shared/presentation/schemas/mdblist.schema.ts
 */

export interface SaveMdbListConfigCommand {
  userId: number;
  apiKey: MdblistApiKeyPrimitive;
}

export interface DeleteMdbListConfigCommand {
  userId: number;
}

export interface GetMdbListConfigCommand {
  userId: number;
}

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
