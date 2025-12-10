import { router } from './trpc';
import { listsRouter } from '../presentation/trpc/routers/lists.router';
import { jellyseerrConfigRouter } from '../presentation/trpc/routers/jellyseerr-config.router';
import { providerConfigRouter } from '../presentation/trpc/routers/provider-config.router';
import { generalSettingsRouter } from '../presentation/trpc/routers/general-settings.router';
import { listsProcessorRouter } from './routers/lists-processor';
import { schedulerRouter } from './routers/scheduler';
import { logsRouter } from './routers/logs';
import { dashboardRouter } from './routers/dashboard';

export const appRouter = router({
  lists: listsRouter,
  config: jellyseerrConfigRouter,
  providerConfig: providerConfigRouter,
  generalSettings: generalSettingsRouter,
  processor: listsProcessorRouter,
  scheduler: schedulerRouter,
  logs: logsRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
