import type { Nullable } from '../../../domain/types/utility.types';
import type { ProviderType } from '../../../domain/types/provider.types';

// Re-export for convenience
export type { ProviderType, Nullable };

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
  provider: ProviderType; // Unwrapped from Provider VO
  enabled: boolean;
  maxItems: number;
  processingSchedule: Nullable<string>;
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
  lastProcessed: Nullable<Date>;
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
  createdAt: Nullable<string>;
  userId: number;
  url: string;
  displayUrl: Nullable<string>;
  updatedAt: Nullable<string>;
  provider: ProviderType;
  enabled: boolean;
  maxItems: Nullable<number>;
  processingSchedule: Nullable<string>;
  lastProcessed: Nullable<string>;
  [key: string]: unknown;
}
