import { z } from 'zod';
import { router, publicProcedure } from '../../../trpc/trpc';
import { ProviderConfigContainer } from '../../di/provider-config-container';

// Zod schemas for input validation
const getConfigSchema = z.object({
  provider: z.enum(['trakt', 'mdblist']),
});

const updateConfigSchema = z.object({
  provider: z.enum(['trakt', 'mdblist']),
  config: z.object({
    clientId: z.string().optional(),
    apiKey: z.string().optional(),
  }),
});

const deleteConfigSchema = z.object({
  provider: z.enum(['trakt', 'mdblist']),
});

/**
 * Provider Config Router - Thin presentation layer
 *
 * This router is a thin adapter that:
 * 1. Validates input with Zod schemas
 * 2. Delegates to use cases via DI container
 * 3. Returns Response DTOs directly (tRPC handles serialization)
 * 4. Contains ZERO business logic
 *
 * New API (3 endpoints instead of 6):
 * - get({ provider })
 * - set({ provider, config })
 * - delete({ provider })
 */
export function createProviderConfigRouter(container: ProviderConfigContainer) {
  return router({
    get: publicProcedure
      .input(getConfigSchema)
      .query(async ({ input, ctx }) => {
        return await container.getProviderConfigUseCase.execute({
          userId: ctx.userId,
          provider: input.provider,
        });
      }),

    set: publicProcedure
      .input(updateConfigSchema)
      .mutation(async ({ input, ctx }) => {
        return await container.updateProviderConfigUseCase.execute({
          userId: ctx.userId,
          provider: input.provider,
          config: input.config,
        });
      }),

    delete: publicProcedure
      .input(deleteConfigSchema)
      .mutation(async ({ input, ctx }) => {
        return await container.deleteProviderConfigUseCase.execute({
          userId: ctx.userId,
          provider: input.provider,
        });
      }),
  });
}

// Export a singleton instance with the global db
import { db } from '../../../db';
const providerConfigContainer = new ProviderConfigContainer(db);
export const providerConfigRouter = createProviderConfigRouter(providerConfigContainer);
