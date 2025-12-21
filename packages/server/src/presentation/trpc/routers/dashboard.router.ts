import { z } from 'zod';
import { router, publicProcedure } from '@/server/presentation/trpc/context';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type {
  GetDashboardStatsCommand,
  GetRecentActivityCommand,
  GetPendingRequestsCommand,
} from 'shared/application/dtos';
import type {
  DashboardStatsResponse,
  GetRecentActivityResponse,
  GetPendingRequestsResponse,
} from 'shared/application/dtos';

export interface DashboardRouterDeps {
  getDashboardStatsUseCase: IUseCase<GetDashboardStatsCommand, DashboardStatsResponse>;
  getRecentActivityUseCase: IUseCase<GetRecentActivityCommand, GetRecentActivityResponse>;
  getPendingRequestsUseCase: IUseCase<GetPendingRequestsCommand, GetPendingRequestsResponse>;
}

/**
 * Dashboard Router - Thin presentation layer
 *
 * This router is a thin adapter that:
 * 1. Validates input with Zod schemas
 * 2. Delegates to use cases via injected dependencies
 * 3. Returns Response DTOs directly
 * 4. Contains ZERO business logic
 */
export function createDashboardRouter(deps: DashboardRouterDeps) {
  return router({
    getStats: publicProcedure.query(async ({ ctx }) => {
      return await deps.getDashboardStatsUseCase.execute({
        userId: ctx.userId,
      });
    }),

    getRecentActivity: publicProcedure
      .input(
        z.object({
          limit: z.number().positive().default(20),
        })
      )
      .query(async ({ ctx, input }) => {
        return await deps.getRecentActivityUseCase.execute({
          userId: ctx.userId,
          limit: input.limit,
        });
      }),

    getPendingRequests: publicProcedure.query(async ({ ctx }) => {
      return await deps.getPendingRequestsUseCase.execute({
        userId: ctx.userId,
      });
    }),
  });
}
