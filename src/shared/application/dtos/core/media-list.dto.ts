import type { Nullable } from '@/shared/types';
import type { ProviderType } from '@/shared/domain/types/provider.types';

// Re-export for convenience
export type { ProviderType };

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
  name: string;              // Unwrapped from ListName VO
  url: string;               // Unwrapped from ListUrl VO
  displayUrl: string;
  provider: ProviderType;    // Unwrapped from Provider VO
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
