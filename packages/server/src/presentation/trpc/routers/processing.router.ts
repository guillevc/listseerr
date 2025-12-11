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
    .mutation(async ({ input, ctx }) => {
      const response = await processingContainer.processListUseCase.execute({
        listId: input.listId,
        triggerType: input.triggerType,
        userId: ctx.userId,
      });
      return response; // Return full ProcessListResponse wrapper
    }),

  /**
   * Process all enabled lists with global deduplication
   */
  processAll: publicProcedure.mutation(async ({ ctx }) => {
    return await processingContainer.processBatchUseCase.execute({
      triggerType: 'manual',
      userId: ctx.userId,
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
    .query(async ({ input, ctx }) => {
      const response = await processingContainer.getExecutionHistoryUseCase.execute({
        listId: input.listId,
        limit: input.limit,
        userId: ctx.userId,
      });
      return response; // Return full GetExecutionHistoryResponse wrapper
    }),
});

// Export singleton container for scheduler integration
export { processingContainer };
