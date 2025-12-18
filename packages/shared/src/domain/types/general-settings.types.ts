/**
 * General Settings Types
 *
 * Pure TypeScript contracts for general settings data.
 * Schemas must satisfy these types.
 */

export type TimezonePrimitive = string;
export type CronSchedulePrimitive = string | null;

export interface GeneralSettingsUpdatePrimitive {
  timezone?: TimezonePrimitive;
  automaticProcessingEnabled?: boolean;
  automaticProcessingSchedule?: CronSchedulePrimitive;
}
