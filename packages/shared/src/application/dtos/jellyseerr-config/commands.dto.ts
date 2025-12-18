import type { JellyseerrConfigPrimitive } from '../../../domain/types/jellyseerr.types';

/**
 * Command DTOs (Input)
 *
 * Pure TypeScript interfaces - no runtime validation.
 * Validation happens in shared/presentation/schemas/jellyseerr.schema.ts
 */

export interface GetJellyseerrConfigCommand {
  userId: number;
}

export interface UpdateJellyseerrConfigCommand {
  userId: number;
  data: JellyseerrConfigPrimitive;
}

export interface DeleteJellyseerrConfigCommand {
  userId: number;
}
