import { router, publicProcedure } from '@/server/presentation/trpc/context';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type { GetScheduledJobsCommand, ReloadSchedulerCommand } from 'shared/application/dtos';
import type { GetScheduledJobsResponse, ReloadSchedulerResponse } from 'shared/application/dtos';

export interface SchedulerRouterDeps {
  getScheduledJobsUseCase: IUseCase<GetScheduledJobsCommand, GetScheduledJobsResponse>;
  reloadSchedulerUseCase: IUseCase<ReloadSchedulerCommand, ReloadSchedulerResponse>;
}

/**
 * Scheduler Router - Thin presentation layer
 *
 * This router is a thin adapter that:
 * 1. Validates input with Zod schemas (if needed)
 * 2. Delegates to use cases via injected dependencies
 * 3. Returns Response DTOs directly
 * 4. Contains ZERO business logic
 *
 * Accepts a getter function to lazily resolve dependencies,
 * avoiding circular dependency issues during module initialization.
 */
export function createSchedulerRouter(getDeps: () => SchedulerRouterDeps) {
  return router({
    getScheduledJobs: publicProcedure.query(async ({ ctx }) => {
      const deps = getDeps();
      return await deps.getScheduledJobsUseCase.execute({
        userId: ctx.userId,
      });
    }),

    reload: publicProcedure.mutation(async ({ ctx }) => {
      const deps = getDeps();
      return await deps.reloadSchedulerUseCase.execute({
        userId: ctx.userId,
      });
    }),
  });
}
