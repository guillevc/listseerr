import { z } from 'zod';
import { router, publicProcedure } from '../context';
import { JellyseerrConfigContainer } from '../../di/jellyseerr-config-container';

// Zod schemas for input validation
const configInputSchema = z.object({
  url: z.string().url('Invalid URL format'),
  apiKey: z.string().min(1, 'API key is required'),
  userIdJellyseerr: z.number().positive('User ID must be positive'),
});

const testConnectionInputSchema = z.object({
  url: z.string().url('Invalid URL format'),
  apiKey: z.string().min(1, 'API key is required'),
});

/**
 * Jellyseerr Config Router - Thin presentation layer
 *
 * This router is a thin adapter that:
 * 1. Validates input with Zod schemas
 * 2. Delegates to use cases via DI container
 * 3. Returns Response DTOs directly (tRPC handles serialization)
 * 4. Contains ZERO business logic
 */
export function createJellyseerrConfigRouter(container: JellyseerrConfigContainer) {
  return router({
    get: publicProcedure.query(async ({ ctx }) => {
      return await container.getJellyseerrConfigUseCase.execute({ userId: ctx.userId });
    }),

    set: publicProcedure.input(configInputSchema).mutation(async ({ input, ctx }) => {
      return await container.updateJellyseerrConfigUseCase.execute({
        userId: ctx.userId,
        data: input,
      });
    }),

    test: publicProcedure.input(testConnectionInputSchema).mutation(async ({ input }) => {
      return await container.testJellyseerrConnectionUseCase.execute(input);
    }),

    delete: publicProcedure.mutation(async ({ ctx }) => {
      return await container.deleteJellyseerrConfigUseCase.execute({ userId: ctx.userId });
    }),
  });
}

// Export a singleton instance with the global db
import { db } from '../../../infrastructure/db/client';
const jellyseerrConfigContainer = new JellyseerrConfigContainer(db);
export const jellyseerrConfigRouter = createJellyseerrConfigRouter(jellyseerrConfigContainer);
