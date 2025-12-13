import { z } from 'zod';
import { router, publicProcedure } from '@/server/presentation/trpc/context';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type {
  GetJellyseerrConfigCommand,
  UpdateJellyseerrConfigCommand,
  DeleteJellyseerrConfigCommand,
} from 'shared/application/dtos/jellyseerr-config/commands.dto';
import type {
  GetJellyseerrConfigResponse,
  UpdateJellyseerrConfigResponse,
  DeleteJellyseerrConfigResponse,
} from 'shared/application/dtos/jellyseerr-config/responses.dto';
import type {
  TestJellyseerrConnectionCommand,
  TestJellyseerrConnectionResponse,
} from 'shared/application/dtos/diagnostics/jellyseerr-connection-test.dto';

export interface JellyseerrConfigRouterDeps {
  getJellyseerrConfigUseCase: IUseCase<GetJellyseerrConfigCommand, GetJellyseerrConfigResponse>;
  updateJellyseerrConfigUseCase: IUseCase<
    UpdateJellyseerrConfigCommand,
    UpdateJellyseerrConfigResponse
  >;
  deleteJellyseerrConfigUseCase: IUseCase<
    DeleteJellyseerrConfigCommand,
    DeleteJellyseerrConfigResponse
  >;
  testJellyseerrConnectionUseCase: IUseCase<
    TestJellyseerrConnectionCommand,
    TestJellyseerrConnectionResponse
  >;
}

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
 * 2. Delegates to use cases via injected dependencies
 * 3. Returns Response DTOs directly (tRPC handles serialization)
 * 4. Contains ZERO business logic
 */
export function createJellyseerrConfigRouter(deps: JellyseerrConfigRouterDeps) {
  return router({
    get: publicProcedure.query(async ({ ctx }) => {
      return await deps.getJellyseerrConfigUseCase.execute({ userId: ctx.userId });
    }),

    set: publicProcedure.input(configInputSchema).mutation(async ({ input, ctx }) => {
      return await deps.updateJellyseerrConfigUseCase.execute({
        userId: ctx.userId,
        data: input,
      });
    }),

    test: publicProcedure.input(testConnectionInputSchema).mutation(async ({ input }) => {
      return await deps.testJellyseerrConnectionUseCase.execute(input);
    }),

    delete: publicProcedure.mutation(async ({ ctx }) => {
      return await deps.deleteJellyseerrConfigUseCase.execute({ userId: ctx.userId });
    }),
  });
}
