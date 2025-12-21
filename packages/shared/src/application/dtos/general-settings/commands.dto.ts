/**
 * General Settings Command DTOs
 *
 * Input contracts for general settings use cases.
 * Contains only primitives - no Value Objects or Entities.
 */

import type { GeneralSettingsUpdatePrimitive } from 'shared/domain/types';

export interface GetGeneralSettingsCommand {
  userId: number;
}

export interface UpdateGeneralSettingsCommand {
  userId: number;
  data: GeneralSettingsUpdatePrimitive;
}
