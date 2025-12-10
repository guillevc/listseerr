import type { Nullable } from '../../../shared/types';

/**
 * Response DTOs (Output)
 *
 * These represent the output data from use cases.
 * They contain only primitives for serialization.
 */

export interface GeneralSettingsDTO {
  id: number;
  userId: number;
  timezone: string;
  automaticProcessingEnabled: boolean;
  automaticProcessingSchedule: Nullable<string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetGeneralSettingsResponse {
  settings: Nullable<GeneralSettingsDTO>;
}

export interface UpdateGeneralSettingsResponse {
  settings: GeneralSettingsDTO;
}
