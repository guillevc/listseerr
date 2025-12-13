import { z } from 'zod';
import { router, publicProcedure } from '@/server/presentation/trpc/context';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type { GetLogsCommand, ClearLogsCommand } from 'shared/application/dtos/logs/commands.dto';
import type {
  GetLogsResponse,
  ClearLogsResponse,
} from 'shared/application/dtos/logs/responses.dto';

export interface LogsRouterDeps {
  getLogsUseCase: IUseCase<GetLogsCommand, GetLogsResponse>;
  clearLogsUseCase: IUseCase<ClearLogsCommand, ClearLogsResponse>;
}

/**
 * Logs Router - Thin presentation layer
 *
 * This router is a thin adapter that:
 * 1. Validates input with Zod schemas
 * 2. Delegates to use cases via injected dependencies
 * 3. Returns Response DTOs directly
 * 4. Contains ZERO business logic
 */
export function createLogsRouter(deps: LogsRouterDeps) {
  return router({
    getLogs: publicProcedure
      .input(
        z.object({
          limit: z.number().min(1).max(1000).default(100),
          level: z.enum(['all', 'debug', 'info', 'warn', 'error']).default('all'),
        })
      )
      .query(async ({ ctx, input }) => {
        return await deps.getLogsUseCase.execute({
          userId: ctx.userId,
          limit: input.limit,
          level: input.level,
        });
      }),

    clearLogs: publicProcedure.mutation(async ({ ctx }) => {
      return await deps.clearLogsUseCase.execute({
        userId: ctx.userId,
      });
    }),
  });
}
