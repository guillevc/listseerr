import type { CronSchedulePrimitive } from '../../../domain/types/general-settings.types';

/**
 * ScheduledJob Core DTO
 *
 * Represents a scheduled job's metadata.
 * Contains only primitives.
 *
 * Used by:
 * - Scheduler service
 * - Scheduler use cases
 * - tRPC router outputs
 */
export interface ScheduledJobDTO {
  name: string;
  cronExpression: NonNullable<CronSchedulePrimitive>;
  nextRun: Date | null;
  isRunning: boolean;
}
