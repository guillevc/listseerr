import { z } from 'zod';
import { router, publicProcedure } from '../context';
import { DashboardContainer } from '../../di/dashboard-container';

/**
 * Dashboard Router - Thin presentation layer
 *
 * This router is a thin adapter that:
 * 1. Validates input with Zod schemas
 * 2. Delegates to use cases via DI container
 * 3. Returns Response DTOs directly
 * 4. Contains ZERO business logic
 *
 * Follows CLAUDE.md Section 2.A mandate:
 * - Returns full wrapped Response DTOs (no destructuring)
 * - All business logic in use cases (including grouping algorithm)
 *
 * Critical: Dashboard container requires database instance
 */

// Lazy-initialized container (needs db from context)
let dashboardContainer: DashboardContainer | null = null;

export const dashboardRouter = router({
  getStats: publicProcedure.query(async ({ ctx }) => {
    if (!dashboardContainer) {
      dashboardContainer = new DashboardContainer(ctx.db);
    }

    return await dashboardContainer.getDashboardStatsUseCase.execute({
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
      if (!dashboardContainer) {
        dashboardContainer = new DashboardContainer(ctx.db);
      }

      return await dashboardContainer.getRecentActivityUseCase.execute({
        userId: ctx.userId,
        limit: input.limit,
      });
    }),

  getPendingRequests: publicProcedure.query(async ({ ctx }) => {
    if (!dashboardContainer) {
      dashboardContainer = new DashboardContainer(ctx.db);
    }

    return await dashboardContainer.getPendingRequestsUseCase.execute({
      userId: ctx.userId,
    });
  }),
});
