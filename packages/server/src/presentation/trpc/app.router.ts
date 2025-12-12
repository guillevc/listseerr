import { router } from './context';
import { listsRouter } from './routers/lists.router';
import { jellyseerrConfigRouter } from './routers/jellyseerr-config.router';
import { providerConfigRouter } from './routers/provider-config.router';
import { generalSettingsRouter } from './routers/general-settings.router';
import { processingRouter } from './routers/processing.router';
import { schedulerRouter } from './routers/scheduler.router';
import { logsRouter } from './routers/logs.router';
import { dashboardRouter } from './routers/dashboard.router';

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
