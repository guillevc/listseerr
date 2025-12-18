import type { TraktConfigDTO } from './core/trakt-config.dto';
import type { TraktClientIdPrimitive } from '../../domain/types/trakt.types';

/**
 * Trakt Config Command DTOs
 *
 * Pure TypeScript interfaces - no runtime validation.
 * Validation happens in shared/presentation/schemas/trakt.schema.ts
 */

export interface SaveTraktConfigCommand {
  userId: number;
  clientId: TraktClientIdPrimitive;
}

export interface DeleteTraktConfigCommand {
  userId: number;
}

export interface GetTraktConfigCommand {
  userId: number;
}

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
