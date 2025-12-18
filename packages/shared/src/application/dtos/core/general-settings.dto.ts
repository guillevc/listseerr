import type {
  TimezonePrimitive,
  CronSchedulePrimitive,
} from '../../../domain/types/general-settings.types';

/**
 * General Settings Core DTO
 *
 * Represents the serialized form of a GeneralSettings entity.
 * Contains only primitives - all Value Objects are unwrapped.
 *
 * Used by:
 * - GeneralSettings entity toDTO() method
 * - General settings use cases
 * - tRPC router outputs
 */
export interface GeneralSettingsDTO {
  id: number;
  userId: number;
  timezone: TimezonePrimitive;
  automaticProcessingEnabled: boolean;
  automaticProcessingSchedule: CronSchedulePrimitive;
  createdAt: Date;
  updatedAt: Date;
}
