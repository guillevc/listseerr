import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { scheduler } from '../../lib/scheduler';

export const schedulerRouter = router({
  getScheduledJobs: publicProcedure.query(async () => {
    return scheduler.getScheduledJobs();
  }),

  reload: publicProcedure.mutation(async ({ ctx }) => {
    await scheduler.loadScheduledLists();
    return { success: true };
  }),
});
