import type {
  JellyseerrUrlPrimitive,
  JellyseerrExternalUrlPrimitive,
  JellyseerrApiKeyPrimitive,
  JellyseerrUserIdPrimitive,
} from '../../../domain/types/jellyseerr.types';

/**
 * Jellyseerr Configuration Core DTO
 *
 * Represents the serialized form of a JellyseerrConfig entity.
 * Contains only primitives - all Value Objects are unwrapped.
 *
 * Used by:
 * - JellyseerrConfig entity toDTO() method
 * - Jellyseerr config use cases
 * - tRPC router outputs
 */
export interface JellyseerrConfigDTO {
  id: number;
  userId: number;
  url: JellyseerrUrlPrimitive;
  externalUrl?: JellyseerrExternalUrlPrimitive;
  apiKey: JellyseerrApiKeyPrimitive;
  userIdJellyseerr: JellyseerrUserIdPrimitive;
  createdAt: Date;
  updatedAt: Date;
}
