/**
 * Trigger Type Types
 *
 * Pure TypeScript contract for trigger type data.
 */

export const TriggerTypeValues = {
  MANUAL: 'manual',
  SCHEDULED: 'scheduled',
} as const;

export type TriggerType = (typeof TriggerTypeValues)[keyof typeof TriggerTypeValues];
