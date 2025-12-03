import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { logBuffer } from '../../lib/log-buffer';

export const logsRouter = router({
  getLogs: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).default(100),
        level: z.enum(['all', 'debug', 'info', 'warn', 'error']).default('all'),
      })
    )
    .query(async ({ input }) => {
      const logs = logBuffer.getLogs(input.limit, input.level);
      return logs;
    }),

  clearLogs: publicProcedure.mutation(async () => {
    logBuffer.clear();
    return { success: true };
  }),
});
