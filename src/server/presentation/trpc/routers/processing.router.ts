import { z } from 'zod';
import { router, publicProcedure } from '../../../trpc/trpc';
import { ProcessingContainer } from '../../di/processing-container';
import { db } from '../../../db';

/**
 * Processing Router (tRPC)
 *
 * Exposes processing operations via tRPC procedures.
 * Delegates to use cases through DI container.
 */

// Singleton container instance
const processingContainer = new ProcessingContainer(db);

export const processingRouter = router({
  /**
   * Process a single list
   */
  processList: publicProcedure
    .input(
      z.object({
        listId: z.number(),
        triggerType: z.enum(['manual', 'scheduled']).default('manual'),
      })
    )
    .mutation(async ({ input }) => {
      const { execution } = await processingContainer.processListUseCase.execute({
        listId: input.listId,
        triggerType: input.triggerType,
        userId: 1, // TODO: ctx.session?.user?.id
      });
      return execution;
    }),

  /**
   * Process all enabled lists with global deduplication
   */
  processAll: publicProcedure.mutation(async () => {
    return await processingContainer.processBatchUseCase.execute({
      triggerType: 'manual',
      userId: 1, // TODO: ctx.session?.user?.id
    });
  }),

  /**
   * Get execution history for a list
   */
  getHistory: publicProcedure
    .input(
      z.object({
        listId: z.number(),
        limit: z.number().positive().default(10),
      })
    )
    .query(async ({ input }) => {
      const { executions } = await processingContainer.getExecutionHistoryUseCase.execute({
        listId: input.listId,
        limit: input.limit,
        userId: 1, // TODO: ctx.session?.user?.id
      });
      return executions;
    }),
});

// Export singleton container for scheduler integration
export { processingContainer };
