import { router, publicProcedure } from '@/server/presentation/trpc/context';
import type { IUseCase } from '@/server/application/use-cases/use-case.interface';
import type {
  GetTraktConfigCommand,
  GetTraktConfigResponse,
} from 'shared/application/dtos/trakt-config.commands.dto';
import type {
  GetMdbListConfigCommand,
  GetMdbListConfigResponse,
} from 'shared/application/dtos/mdblist-config.commands.dto';

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
