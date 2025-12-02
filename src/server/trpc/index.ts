import { router } from './trpc';
import { listsRouter } from './routers/lists';
import { configRouter } from './routers/config';
import { listsProcessorRouter } from './routers/lists-processor';
import { schedulerRouter } from './routers/scheduler';

export const appRouter = router({
  lists: listsRouter,
  config: configRouter,
  processor: listsProcessorRouter,
  scheduler: schedulerRouter,
});

export type AppRouter = typeof appRouter;
