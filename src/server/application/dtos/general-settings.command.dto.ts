import type { Nullable } from '../../../shared/types';

/**
 * Command DTOs (Input)
 *
 * These represent the input data for each use case.
 * They contain only primitives - no Value Objects or Entities.
 */

export interface GetGeneralSettingsCommand {
  userId: number;
}

export interface UpdateGeneralSettingsCommand {
  userId: number;
  data: {
    timezone?: string;
    automaticProcessingEnabled?: boolean;
    automaticProcessingSchedule?: Nullable<string>;
  };
}
