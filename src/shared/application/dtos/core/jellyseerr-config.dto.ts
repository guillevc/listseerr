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
  url: string;
  apiKey: string;
  userIdJellyseerr: number;
  createdAt: Date;
  updatedAt: Date;
}
