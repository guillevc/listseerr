import { router, publicProcedure } from '@/server/presentation/trpc/context';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type {
  GetTraktConfigCommand,
  GetTraktConfigResponse,
  SaveTraktConfigCommand,
  TraktConfigResponse,
  DeleteTraktConfigCommand,
  DeleteTraktConfigResponse,
} from 'shared/application/dtos/trakt-config.commands.dto';
import { saveTraktConfigSchema } from 'shared/application/dtos/trakt-config.commands.dto';

export interface TraktConfigRouterDeps {
  getTraktConfigUseCase: IUseCase<GetTraktConfigCommand, GetTraktConfigResponse>;
  saveTraktConfigUseCase: IUseCase<SaveTraktConfigCommand, TraktConfigResponse>;
  deleteTraktConfigUseCase: IUseCase<DeleteTraktConfigCommand, DeleteTraktConfigResponse>;
}

export function createTraktConfigRouter(deps: TraktConfigRouterDeps) {
  return router({
    get: publicProcedure.query(async ({ ctx }) => {
      return await deps.getTraktConfigUseCase.execute({ userId: ctx.userId });
    }),

    save: publicProcedure.input(saveTraktConfigSchema).mutation(async ({ input, ctx }) => {
      return await deps.saveTraktConfigUseCase.execute({
        userId: ctx.userId,
        clientId: input.clientId,
      });
    }),

    delete: publicProcedure.mutation(async ({ ctx }) => {
      return await deps.deleteTraktConfigUseCase.execute({ userId: ctx.userId });
    }),
  });
}
