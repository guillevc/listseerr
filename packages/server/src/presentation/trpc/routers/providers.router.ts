import { router, publicProcedure } from '@/server/presentation/trpc/context';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type { GetTraktConfigCommand } from 'shared/application/dtos';
import type { GetTraktConfigResponse } from 'shared/application/dtos';
import type { GetMdbListConfigCommand } from 'shared/application/dtos';
import type { GetMdbListConfigResponse } from 'shared/application/dtos';

export interface ProvidersRouterDeps {
  getTraktConfigUseCase: IUseCase<GetTraktConfigCommand, GetTraktConfigResponse>;
  getMdbListConfigUseCase: IUseCase<GetMdbListConfigCommand, GetMdbListConfigResponse>;
}

export function createProvidersRouter(deps: ProvidersRouterDeps) {
  return router({
    getAllConfigs: publicProcedure.query(async ({ ctx }) => {
      const [trakt, mdblist] = await Promise.all([
        deps.getTraktConfigUseCase.execute({ userId: ctx.userId }),
        deps.getMdbListConfigUseCase.execute({ userId: ctx.userId }),
      ]);

      return {
        trakt: trakt.config,
        mdblist: mdblist.config,
      };
    }),
  });
}
