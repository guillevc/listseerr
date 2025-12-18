import type { TraktClientIdPrimitive } from '../../../domain/types/trakt.types';

/**
 * TraktConfig Core DTO
 *
 * Represents the serialized form of a TraktConfig entity.
 * Contains only primitives - Value Objects are unwrapped.
 */
export interface TraktConfigDTO {
  id: number;
  userId: number;
  clientId: TraktClientIdPrimitive;
  createdAt: Date;
  updatedAt: Date;
}
