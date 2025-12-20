/**
 * General Settings Types
 *
 * Pure TypeScript contracts for general settings data.
 * Schemas must satisfy these types.
 */

export type CronSchedulePrimitive = string | null;

export interface GeneralSettingsUpdatePrimitive {
  automaticProcessingEnabled?: boolean;
  automaticProcessingSchedule?: CronSchedulePrimitive;
}
