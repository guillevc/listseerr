import { router, publicProcedure } from '@/server/presentation/trpc/context';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type {
  GetSeerrConfigCommand,
  UpdateSeerrConfigCommand,
  DeleteSeerrConfigCommand,
} from 'shared/application/dtos';
import type {
  GetSeerrConfigResponse,
  UpdateSeerrConfigResponse,
  DeleteSeerrConfigResponse,
} from 'shared/application/dtos';
import type {
  TestSeerrConnectionCommand,
  TestSeerrConnectionResponse,
} from 'shared/application/dtos';
import { seerrConfigSchema, seerrTestConnectionSchema } from 'shared/presentation/schemas';

export interface SeerrConfigRouterDeps {
  getSeerrConfigUseCase: IUseCase<GetSeerrConfigCommand, GetSeerrConfigResponse>;
  updateSeerrConfigUseCase: IUseCase<UpdateSeerrConfigCommand, UpdateSeerrConfigResponse>;
  deleteSeerrConfigUseCase: IUseCase<DeleteSeerrConfigCommand, DeleteSeerrConfigResponse>;
  testSeerrConnectionUseCase: IUseCase<TestSeerrConnectionCommand, TestSeerrConnectionResponse>;
}

/**
 * Seerr Config Router - Thin presentation layer
 *
 * This router is a thin adapter that:
 * 1. Validates input with Zod schemas
 * 2. Delegates to use cases via injected dependencies
 * 3. Returns Response DTOs directly (tRPC handles serialization)
 * 4. Contains ZERO business logic
 */
export function createSeerrConfigRouter(deps: SeerrConfigRouterDeps) {
  return router({
    get: publicProcedure.query(async ({ ctx }) => {
      return await deps.getSeerrConfigUseCase.execute({ userId: ctx.userId });
    }),

    set: publicProcedure.input(seerrConfigSchema).mutation(async ({ input, ctx }) => {
      return await deps.updateSeerrConfigUseCase.execute({
        userId: ctx.userId,
        data: input,
      });
    }),

    test: publicProcedure.input(seerrTestConnectionSchema).mutation(async ({ input }) => {
      return await deps.testSeerrConnectionUseCase.execute(input);
    }),

    delete: publicProcedure.mutation(async ({ ctx }) => {
      return await deps.deleteSeerrConfigUseCase.execute({ userId: ctx.userId });
    }),
  });
}
