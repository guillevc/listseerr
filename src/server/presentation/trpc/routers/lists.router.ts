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
    getAll: publicProcedure.query(async () => {
      const { lists } = await container.getAllMediaListsUseCase.execute({ userId: 1 });
      return lists;
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const { list } = await container.getMediaListByIdUseCase.execute(input);
        return list;
      }),

    create: publicProcedure
      .input(listInputSchema)
      .mutation(async ({ input }) => {
        const { list } = await container.createMediaListUseCase.execute({
          ...input,
          userId: 1, // Default user
          processingSchedule: input.processingSchedule ?? null, // Convert undefined to null
        });
        return list;
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          data: listInputSchema.partial(),
        })
      )
      .mutation(async ({ input }) => {
        const { list } = await container.updateMediaListUseCase.execute(input);
        return list;
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await container.deleteMediaListUseCase.execute(input);
      }),

    toggleEnabled: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { list } = await container.toggleListEnabledUseCase.execute(input);
        return list;
      }),

    enableAll: publicProcedure.mutation(async () => {
      return await container.enableAllListsUseCase.execute({ userId: 1 });
    }),
  });
}

// Export a singleton instance with the global db
import { db } from '../../../db';
const listsContainer = new ListsContainer(db);
export const listsRouter = createListsRouter(listsContainer);
