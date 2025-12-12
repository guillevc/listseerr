import { router, publicProcedure } from '../context';
import { SchedulerContainer } from '../../di/scheduler-container';

/**
 * Scheduler Router - Thin presentation layer
 *
 * This router is a thin adapter that:
 * 1. Validates input with Zod schemas (if needed)
 * 2. Delegates to use cases via DI container
 * 3. Returns Response DTOs directly
 * 4. Contains ZERO business logic
 *
 * Follows CLAUDE.md Section 2.A mandate:
 * - Returns full wrapped Response DTOs (no destructuring)
 * - All business logic in use cases
 */

// Singleton container instance
const schedulerContainer = new SchedulerContainer();

export const schedulerRouter = router({
  getScheduledJobs: publicProcedure.query(async ({ ctx }) => {
    return await schedulerContainer.getScheduledJobsUseCase.execute({
      userId: ctx.userId,
    });
  }),

  reload: publicProcedure.mutation(async ({ ctx }) => {
    return await schedulerContainer.reloadSchedulerUseCase.execute({
      userId: ctx.userId,
    });
  }),
});
