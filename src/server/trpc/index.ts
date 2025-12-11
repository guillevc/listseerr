import { router } from './trpc';
import { listsRouter } from '../presentation/trpc/routers/lists.router';
import { jellyseerrConfigRouter } from '../presentation/trpc/routers/jellyseerr-config.router';
import { providerConfigRouter } from '../presentation/trpc/routers/provider-config.router';
import { generalSettingsRouter } from '../presentation/trpc/routers/general-settings.router';
import { processingRouter } from '../presentation/trpc/routers/processing.router';
import { schedulerRouter } from '../presentation/trpc/routers/scheduler.router';
import { logsRouter } from '../presentation/trpc/routers/logs.router';
import { dashboardRouter } from '../presentation/trpc/routers/dashboard.router';

export const appRouter = router({
  lists: listsRouter,
  config: jellyseerrConfigRouter,
  providerConfig: providerConfigRouter,
  generalSettings: generalSettingsRouter,
  processor: processingRouter,
  scheduler: schedulerRouter,
  logs: logsRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
