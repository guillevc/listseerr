import type { UsernamePrimitive } from '../../../domain/types/auth.types';

/**
 * User Core DTO
 *
 * Represents the serialized form of a User entity.
 * Contains only primitives - excludes sensitive data like password hash.
 *
 * Used by:
 * - User mapper toDTO() method
 * - Auth use cases
 * - tRPC router outputs
 */
export interface UserDTO {
  id: number;
  username: UsernamePrimitive;
  createdAt: Date;
}

/**
 * Serialized User (as received by tRPC client)
 *
 * Date objects are serialized to ISO strings over the wire.
 * Use this type on the client side for type-safe date handling.
 */
export interface SerializedUser {
  id: number;
  username: UsernamePrimitive;
  createdAt: string;
}
