/**
 * App Router Assembly - Composition Root
 *
 * This is the final assembly point for all tRPC routers.
 * It imports the built routers from routers.ts and assembles
 * them into the application router.
 */

import { router } from '@/server/presentation/trpc/context';
import {
  listsRouter,
  processingRouter,
  dashboardRouter,
  logsRouter,
  schedulerRouter,
  providerConfigRouter,
  generalSettingsRouter,
  jellyseerrConfigRouter,
} from './routers';

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
