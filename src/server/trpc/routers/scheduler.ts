import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

// This will be a simple router for now
// The actual scheduler implementation will be in the scheduler service
export const schedulerRouter = router({
  getSchedule: publicProcedure.query(async () => {
    // TODO: Implement actual schedule retrieval
    return {
      enabled: false,
      interval: '0 */6 * * *', // Every 6 hours
    };
  }),

  updateSchedule: publicProcedure
    .input(
      z.object({
        enabled: z.boolean(),
        interval: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // TODO: Implement actual schedule update logic
      return {
        success: true,
        ...input,
      };
    }),
});
