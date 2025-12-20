import type { CronSchedulePrimitive } from '../../../domain/types/general-settings.types';

/**
 * General Settings Core DTO
 *
 * Represents the serialized form of a GeneralSettings entity.
 * Contains only primitives - all Value Objects are unwrapped.
 *
 * Note: Timezone is configured via TZ environment variable, not stored in DB.
 *
 * Used by:
 * - GeneralSettings entity toDTO() method
 * - General settings use cases
 * - tRPC router outputs
 */
export interface GeneralSettingsDTO {
  id: number;
  userId: number;
  automaticProcessingEnabled: boolean;
  automaticProcessingSchedule: CronSchedulePrimitive;
  createdAt: Date;
  updatedAt: Date;
}
