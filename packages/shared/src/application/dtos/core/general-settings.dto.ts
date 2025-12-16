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
  timezone: string;
  automaticProcessingEnabled: boolean;
  automaticProcessingSchedule: string | null;
  createdAt: Date;
  updatedAt: Date;
}
