import type { TraktClientIdPrimitive } from '../../../domain/types/trakt.types';

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
