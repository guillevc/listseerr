import type { MdblistApiKeyPrimitive } from '../../../domain/types/mdblist.types';

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
