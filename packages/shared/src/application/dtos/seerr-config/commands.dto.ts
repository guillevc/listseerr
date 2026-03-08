import type { SeerrConfigPrimitive } from '../../../domain/types/seerr.types';

/**
 * Command DTOs (Input)
 *
 * Pure TypeScript interfaces - no runtime validation.
 * Validation happens in shared/presentation/schemas/seerr.schema.ts
 */

export interface GetSeerrConfigCommand {
  userId: number;
}

export interface UpdateSeerrConfigCommand {
  userId: number;
  data: SeerrConfigPrimitive;
}

export interface DeleteSeerrConfigCommand {
  userId: number;
}
