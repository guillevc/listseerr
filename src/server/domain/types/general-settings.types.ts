import type { Nullable } from '../../../shared/types';
import { Timezone } from '../value-objects/timezone.value-object';

export interface GeneralSettingsProps {
  id: number;
  userId: number;
  timezone: Timezone;
  automaticProcessingEnabled: boolean;
  automaticProcessingSchedule: Nullable<string>;
  createdAt: Date;
  updatedAt: Date;
}
