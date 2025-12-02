import { router } from './trpc';
import { listsRouter } from './routers/lists';
import { configRouter } from './routers/config';
import { syncRouter } from './routers/sync';
import { schedulerRouter } from './routers/scheduler';

export const appRouter = router({
  lists: listsRouter,
  config: configRouter,
  sync: syncRouter,
  scheduler: schedulerRouter,
});

export type AppRouter = typeof appRouter;
