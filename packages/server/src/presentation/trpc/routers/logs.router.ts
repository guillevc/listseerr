import { z } from 'zod';
import { router, publicProcedure } from '../context';
import { LogsContainer } from '../../di/logs-container';

/**
 * Logs Router - Thin presentation layer
 *
 * This router is a thin adapter that:
 * 1. Validates input with Zod schemas
 * 2. Delegates to use cases via DI container
 * 3. Returns Response DTOs directly
 * 4. Contains ZERO business logic
 *
 * Follows CLAUDE.md Section 2.A mandate:
 * - Returns full wrapped Response DTOs (no destructuring)
 * - All business logic in use cases
 */

// Singleton container instance
const logsContainer = new LogsContainer();

export const logsRouter = router({
  getLogs: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(1000).default(100),
        level: z.enum(['all', 'debug', 'info', 'warn', 'error']).default('all'),
      })
    )
    .query(async ({ ctx, input }) => {
      return await logsContainer.getLogsUseCase.execute({
        userId: ctx.userId,
        limit: input.limit,
        level: input.level,
      });
    }),

  clearLogs: publicProcedure.mutation(async ({ ctx }) => {
    return await logsContainer.clearLogsUseCase.execute({
      userId: ctx.userId,
    });
  }),
});
