import { z } from 'zod';
import { router, publicProcedure } from '../../../trpc/trpc';
import { ListsContainer } from '../../di/lists-container';

// Zod schemas for input validation
const listInputSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  displayUrl: z.string().optional(),
  provider: z.enum(['trakt', 'mdblist', 'traktChart', 'stevenlu']).default('trakt'),
  enabled: z.boolean().default(true),
  maxItems: z.number().positive().max(50).default(20),
  processingSchedule: z.string().optional(),
});

/**
 * Lists Router - Thin presentation layer for media list management
 *
 * This router is a thin adapter that:
 * 1. Validates input with Zod schemas
 * 2. Delegates to use cases via DI container
 * 3. Returns Response DTOs directly (tRPC handles serialization)
 * 4. Contains ZERO business logic
 *
 * All business logic lives in the use cases (application layer).
 */
export function createListsRouter(container: ListsContainer) {
  return router({
    getAll: publicProcedure.query(async ({ ctx }) => {
      return await container.getAllMediaListsUseCase.execute({ userId: ctx.userId });
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        return await container.getMediaListByIdUseCase.execute({
          id: input.id,
          userId: ctx.userId,
        });
      }),

    create: publicProcedure
      .input(listInputSchema)
      .mutation(async ({ input, ctx }) => {
        return await container.createMediaListUseCase.execute({
          ...input,
          userId: ctx.userId,
          processingSchedule: input.processingSchedule ?? null, // Convert undefined to null
        });
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          data: listInputSchema.partial(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await container.updateMediaListUseCase.execute({
          id: input.id,
          userId: ctx.userId,
          data: input.data,
        });
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await container.deleteMediaListUseCase.execute({
          id: input.id,
          userId: ctx.userId,
        });
      }),

    toggleEnabled: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return await container.toggleListEnabledUseCase.execute({
          id: input.id,
          userId: ctx.userId,
        });
      }),

    enableAll: publicProcedure.mutation(async ({ ctx }) => {
      return await container.enableAllListsUseCase.execute({ userId: ctx.userId });
    }),
  });
}

// Export a singleton instance with the global db
import { db } from '../../../db';
const listsContainer = new ListsContainer(db);
export const listsRouter = createListsRouter(listsContainer);
