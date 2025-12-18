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
  generalSettingsRouter,
  jellyseerrConfigRouter,
  traktConfigRouter,
  mdblistConfigRouter,
  providersRouter,
  authRouter,
} from './routers';

export const appRouter = router({
  auth: authRouter,
  lists: listsRouter,
  config: jellyseerrConfigRouter,
  traktConfig: traktConfigRouter,
  mdblistConfig: mdblistConfigRouter,
  providers: providersRouter,
  generalSettings: generalSettingsRouter,
  processor: processingRouter,
  scheduler: schedulerRouter,
  logs: logsRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
