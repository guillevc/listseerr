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
import {
  jellyseerrConfigSchema,
  jellyseerrTestConnectionSchema,
} from 'shared/presentation/schemas/jellyseerr.schema';

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

    set: publicProcedure.input(jellyseerrConfigSchema).mutation(async ({ input, ctx }) => {
      return await deps.updateJellyseerrConfigUseCase.execute({
        userId: ctx.userId,
        data: input,
      });
    }),

    test: publicProcedure.input(jellyseerrTestConnectionSchema).mutation(async ({ input }) => {
      return await deps.testJellyseerrConnectionUseCase.execute(input);
    }),

    delete: publicProcedure.mutation(async ({ ctx }) => {
      return await deps.deleteJellyseerrConfigUseCase.execute({ userId: ctx.userId });
    }),
  });
}
