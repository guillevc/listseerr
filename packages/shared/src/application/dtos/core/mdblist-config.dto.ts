import type { MdblistApiKeyPrimitive } from '../../../domain/types/mdblist.types';

/**
 * MdbListConfig Core DTO
 *
 * Represents the serialized form of a MdbListConfig entity.
 * Contains only primitives - Value Objects are unwrapped.
 */
export interface MdbListConfigDTO {
  id: number;
  userId: number;
  apiKey: MdblistApiKeyPrimitive;
  createdAt: Date;
  updatedAt: Date;
}
