import { z } from 'zod';
import { router, publicProcedure } from '@/server/presentation/trpc/context';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type {
  GetGeneralSettingsCommand,
  UpdateGeneralSettingsCommand,
} from 'shared/application/dtos/general-settings/commands.dto';
import type {
  GetGeneralSettingsResponse,
  UpdateGeneralSettingsResponse,
} from 'shared/application/dtos/general-settings/responses.dto';

export interface GeneralSettingsRouterDeps {
  getGeneralSettingsUseCase: IUseCase<GetGeneralSettingsCommand, GetGeneralSettingsResponse>;
  updateGeneralSettingsUseCase: IUseCase<
    UpdateGeneralSettingsCommand,
    UpdateGeneralSettingsResponse
  >;
}

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
 * 2. Delegates to use cases via injected dependencies
 * 3. Returns Response DTOs directly (tRPC handles serialization)
 * 4. Contains ZERO business logic
 *
 * All business logic lives in the use cases (application layer).
 */
export function createGeneralSettingsRouter(deps: GeneralSettingsRouterDeps) {
  return router({
    get: publicProcedure.query(async ({ ctx }) => {
      return await deps.getGeneralSettingsUseCase.execute({ userId: ctx.userId });
    }),

    set: publicProcedure.input(settingsInputSchema).mutation(async ({ input, ctx }) => {
      return await deps.updateGeneralSettingsUseCase.execute({
        userId: ctx.userId,
        data: input,
      });
    }),
  });
}
