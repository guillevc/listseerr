import type {
  SeerrUrlPrimitive,
  SeerrExternalUrlPrimitive,
  SeerrApiKeyPrimitive,
  SeerrUserIdPrimitive,
  TvSeasonsPrimitive,
} from '../../../domain/types/seerr.types';

/**
 * Seerr Configuration Core DTO
 *
 * Represents the serialized form of a SeerrConfig entity.
 * Contains only primitives - all Value Objects are unwrapped.
 *
 * Used by:
 * - SeerrConfig entity toDTO() method
 * - Seerr config use cases
 * - tRPC router outputs
 */
export interface SeerrConfigDTO {
  id: number;
  userId: number;
  url: SeerrUrlPrimitive;
  externalUrl?: SeerrExternalUrlPrimitive;
  apiKey: SeerrApiKeyPrimitive;
  userIdSeerr: SeerrUserIdPrimitive;
  tvSeasons: TvSeasonsPrimitive;
  createdAt: Date;
  updatedAt: Date;
}
