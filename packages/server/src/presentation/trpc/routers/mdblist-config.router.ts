import { router, publicProcedure } from '@/server/presentation/trpc/context';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type {
  GetMdbListConfigCommand,
  SaveMdbListConfigCommand,
  DeleteMdbListConfigCommand,
} from 'shared/application/dtos';
import type {
  GetMdbListConfigResponse,
  MdbListConfigResponse,
  DeleteMdbListConfigResponse,
} from 'shared/application/dtos';
import { mdblistConfigSchema } from 'shared/presentation/schemas';

export interface MdbListConfigRouterDeps {
  getMdbListConfigUseCase: IUseCase<GetMdbListConfigCommand, GetMdbListConfigResponse>;
  saveMdbListConfigUseCase: IUseCase<SaveMdbListConfigCommand, MdbListConfigResponse>;
  deleteMdbListConfigUseCase: IUseCase<DeleteMdbListConfigCommand, DeleteMdbListConfigResponse>;
}

export function createMdbListConfigRouter(deps: MdbListConfigRouterDeps) {
  return router({
    get: publicProcedure.query(async ({ ctx }) => {
      return await deps.getMdbListConfigUseCase.execute({ userId: ctx.userId });
    }),

    save: publicProcedure.input(mdblistConfigSchema).mutation(async ({ input, ctx }) => {
      return await deps.saveMdbListConfigUseCase.execute({
        userId: ctx.userId,
        apiKey: input.apiKey,
      });
    }),

    delete: publicProcedure.mutation(async ({ ctx }) => {
      return await deps.deleteMdbListConfigUseCase.execute({ userId: ctx.userId });
    }),
  });
}
