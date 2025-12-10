import { z } from 'zod';
import { router, publicProcedure } from '../../../trpc/trpc';
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
    get: publicProcedure.query(async () => {
      const { config } = await container.getJellyseerrConfigUseCase.execute({ userId: 1 });
      return config;
    }),

    set: publicProcedure
      .input(configInputSchema)
      .mutation(async ({ input }) => {
        const { config } = await container.updateJellyseerrConfigUseCase.execute({
          userId: 1, // Default user (hardcoded for now)
          data: input,
        });
        return config;
      }),

    test: publicProcedure
      .input(testConnectionInputSchema)
      .mutation(async ({ input }) => {
        return await container.testJellyseerrConnectionUseCase.execute(input);
      }),

    delete: publicProcedure.mutation(async () => {
      return await container.deleteJellyseerrConfigUseCase.execute({ userId: 1 });
    }),
  });
}

// Export a singleton instance with the global db
import { db } from '../../../db';
const jellyseerrConfigContainer = new JellyseerrConfigContainer(db);
export const jellyseerrConfigRouter = createJellyseerrConfigRouter(jellyseerrConfigContainer);
