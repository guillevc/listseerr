import type { ProviderType } from '../../../domain/value-objects/provider.vo';

/**
 * MediaList Core DTO
 *
 * Represents the serialized form of a MediaList entity.
 * Contains only primitives - all Value Objects are unwrapped.
 *
 * Used by:
 * - MediaList entity toDTO() method
 * - Media list use cases
 * - tRPC router outputs
 */
export interface MediaListDTO {
  id: number;
  userId: number;
  name: string; // Unwrapped from ListName VO
  url: string; // Unwrapped from ListUrl VO
  displayUrl: string;
  provider: ProviderType;
  enabled: boolean;
  maxItems: number;
  processingSchedule: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * MediaListWithLastProcessed DTO
 *
 * Extended DTO with last processed timestamp.
 * Used for list views that show processing history.
 */
export interface MediaListWithLastProcessedDTO extends MediaListDTO {
  lastProcessed: Date | null;
}

/**
 * SerializedMediaList
 *
 * MediaList as received from tRPC (dates serialized to strings).
 * This represents how the client receives MediaList data over the wire,
 * where Date objects are automatically serialized to ISO string format.
 *
 * Used by:
 * - Client components that consume tRPC endpoints
 * - TypeScript type inference for tRPC client calls
 */
export interface SerializedMediaList {
  id: number;
  name: string;
  createdAt: string | null;
  userId: number;
  url: string;
  displayUrl: string | null;
  updatedAt: string | null;
  provider: string;
  enabled: boolean;
  maxItems: number | null;
  processingSchedule: string | null;
  lastProcessed: string | null;
  [key: string]: unknown;
}
