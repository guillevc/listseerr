/**
 * TraktConfig Core DTO
 *
 * Represents the serialized form of a TraktConfig entity.
 * Contains only primitives - Value Objects are unwrapped.
 */
export interface TraktConfigDTO {
  id: number;
  userId: number;
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
}
