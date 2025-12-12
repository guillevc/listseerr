import { z } from 'zod';
import { router, publicProcedure } from '@/server/presentation/trpc/context';
import { GeneralSettingsContainer } from '@/server/presentation/di/general-settings-container';

// Zod schemas for input validation
const settingsInputSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required').optional(),
  automaticProcessingEnabled: z.boolean().optional(),
  automaticProcessingSchedule: z.string().nullable().optional(),
});

/**
 * General Settings Router - Thin presentation layer
 *
 * This router is a thin adapter that:
 * 1. Validates input with Zod schemas
 * 2. Delegates to use cases via DI container
 * 3. Returns Response DTOs directly (tRPC handles serialization)
 * 4. Contains ZERO business logic
 *
 * All business logic lives in the use cases (application layer).
 */
export function createGeneralSettingsRouter(container: GeneralSettingsContainer) {
  return router({
    get: publicProcedure.query(async ({ ctx }) => {
      return await container.getGeneralSettingsUseCase.execute({ userId: ctx.userId });
    }),

    set: publicProcedure.input(settingsInputSchema).mutation(async ({ input, ctx }) => {
      return await container.updateGeneralSettingsUseCase.execute({
        userId: ctx.userId,
        data: input,
      });
    }),
  });
}

// Export a singleton instance with the global db
import { db } from '@/server/infrastructure/db/client';
const generalSettingsContainer = new GeneralSettingsContainer(db);
export const generalSettingsRouter = createGeneralSettingsRouter(generalSettingsContainer);
