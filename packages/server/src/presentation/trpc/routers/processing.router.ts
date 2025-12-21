import { z } from 'zod';
import { router, publicProcedure } from '@/server/presentation/trpc/context';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type {
  ProcessListCommand,
  ProcessBatchCommand,
  GetExecutionHistoryCommand,
} from 'shared/application/dtos';
import type {
  ProcessListResponse,
  ProcessBatchResponse,
  GetExecutionHistoryResponse,
} from 'shared/application/dtos';

export interface ProcessingRouterDeps {
  processListUseCase: IUseCase<ProcessListCommand, ProcessListResponse>;
  processBatchUseCase: IUseCase<ProcessBatchCommand, ProcessBatchResponse>;
  getExecutionHistoryUseCase: IUseCase<GetExecutionHistoryCommand, GetExecutionHistoryResponse>;
}

/**
 * Processing Router (tRPC)
 *
 * Exposes processing operations via tRPC procedures.
 * Delegates to use cases through injected dependencies.
 */
export function createProcessingRouter(deps: ProcessingRouterDeps) {
  return router({
    processList: publicProcedure
      .input(
        z.object({
          listId: z.number(),
          triggerType: z.enum(['manual', 'scheduled']).default('manual'),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await deps.processListUseCase.execute({
          listId: input.listId,
          triggerType: input.triggerType,
          userId: ctx.userId,
        });
      }),

    processAll: publicProcedure.mutation(async ({ ctx }) => {
      return await deps.processBatchUseCase.execute({
        triggerType: 'manual',
        userId: ctx.userId,
      });
    }),

    getHistory: publicProcedure
      .input(
        z.object({
          listId: z.number(),
          limit: z.number().positive().default(10),
        })
      )
      .query(async ({ input, ctx }) => {
        return await deps.getExecutionHistoryUseCase.execute({
          listId: input.listId,
          limit: input.limit,
          userId: ctx.userId,
        });
      }),
  });
}
