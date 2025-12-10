import { router } from './trpc';
import { listsRouter } from '../presentation/trpc/routers/lists.router';
import { configRouter } from './routers/config';
import { providerConfigRouter } from './routers/provider-config';
import { generalSettingsRouter } from './routers/general-settings';
import { listsProcessorRouter } from './routers/lists-processor';
import { schedulerRouter } from './routers/scheduler';
import { logsRouter } from './routers/logs';
import { dashboardRouter } from './routers/dashboard';

export const appRouter = router({
  lists: listsRouter,
  config: configRouter,
  providerConfig: providerConfigRouter,
  generalSettings: generalSettingsRouter,
  processor: listsProcessorRouter,
  scheduler: schedulerRouter,
  logs: logsRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
