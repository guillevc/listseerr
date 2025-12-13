import { z } from 'zod';
import { router, publicProcedure } from '@/server/presentation/trpc/context';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type {
  GetProviderConfigCommand,
  UpdateProviderConfigCommand,
  DeleteProviderConfigCommand,
} from 'shared/application/dtos/provider-config/commands.dto';
import type {
  GetProviderConfigResponse,
  UpdateProviderConfigResponse,
  DeleteProviderConfigResponse,
} from 'shared/application/dtos/provider-config/responses.dto';
import { ProviderValues } from 'shared/domain/types/provider.types';

export interface ProviderConfigRouterDeps {
  getProviderConfigUseCase: IUseCase<GetProviderConfigCommand, GetProviderConfigResponse>;
  updateProviderConfigUseCase: IUseCase<UpdateProviderConfigCommand, UpdateProviderConfigResponse>;
  deleteProviderConfigUseCase: IUseCase<DeleteProviderConfigCommand, DeleteProviderConfigResponse>;
}

// Zod schemas for input validation
const getConfigSchema = z.object({
  provider: z.enum([ProviderValues.TRAKT, ProviderValues.MDBLIST] as const),
});

const updateConfigSchema = z.object({
  provider: z.enum([ProviderValues.TRAKT, ProviderValues.MDBLIST] as const),
  config: z.object({
    clientId: z.string().optional(),
    apiKey: z.string().optional(),
  }),
});

const deleteConfigSchema = z.object({
  provider: z.enum([ProviderValues.TRAKT, ProviderValues.MDBLIST] as const),
});

/**
 * Provider Config Router - Thin presentation layer
 *
 * This router is a thin adapter that:
 * 1. Validates input with Zod schemas
 * 2. Delegates to use cases via injected dependencies
 * 3. Returns Response DTOs directly (tRPC handles serialization)
 * 4. Contains ZERO business logic
 */
export function createProviderConfigRouter(deps: ProviderConfigRouterDeps) {
  return router({
    get: publicProcedure.input(getConfigSchema).query(async ({ input, ctx }) => {
      return await deps.getProviderConfigUseCase.execute({
        userId: ctx.userId,
        provider: input.provider,
      });
    }),

    set: publicProcedure.input(updateConfigSchema).mutation(async ({ input, ctx }) => {
      return await deps.updateProviderConfigUseCase.execute({
        userId: ctx.userId,
        provider: input.provider,
        config: input.config,
      });
    }),

    delete: publicProcedure.input(deleteConfigSchema).mutation(async ({ input, ctx }) => {
      return await deps.deleteProviderConfigUseCase.execute({
        userId: ctx.userId,
        provider: input.provider,
      });
    }),
  });
}
