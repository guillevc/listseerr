import type { Nullable } from '@/shared/domain/types/utility.types';

/**
 * General Settings Command DTOs
 *
 * Input contracts for general settings use cases.
 * Contains only primitives - no Value Objects or Entities.
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
