/**
 * Router Assembly - Composition Root
 *
 * This module is part of the composition root. It:
 * 1. Creates all DI containers with their dependencies
 * 2. Imports router factory functions from presentation
 * 3. Builds all routers by calling factories with containers
 * 4. Exports the built routers for use in app.router.ts
 */

import { db } from '@/server/infrastructure/db/client';

// Import DI containers
import { ListsContainer } from './di/lists-container';
import { ProcessingContainer } from './di/processing-container';
import { DashboardContainer } from './di/dashboard-container';
import { LogsContainer } from './di/logs-container';
import { SchedulerContainer } from './di/scheduler-container';
import { GeneralSettingsContainer } from './di/general-settings-container';
import { JellyseerrConfigContainer } from './di/jellyseerr-config-container';
import { TraktConfigContainer } from './di/trakt-config-container';
import { MdbListConfigContainer } from './di/mdblist-config-container';
import { AuthContainer } from './di/auth-container';

// Import router factories from presentation
import { createListsRouter } from '@/server/presentation/trpc/routers/lists.router';
import { createProcessingRouter } from '@/server/presentation/trpc/routers/processing.router';
import { createDashboardRouter } from '@/server/presentation/trpc/routers/dashboard.router';
import { createLogsRouter } from '@/server/presentation/trpc/routers/logs.router';
import { createSchedulerRouter } from '@/server/presentation/trpc/routers/scheduler.router';
import { createGeneralSettingsRouter } from '@/server/presentation/trpc/routers/general-settings.router';
import { createJellyseerrConfigRouter } from '@/server/presentation/trpc/routers/jellyseerr-config.router';
import { createTraktConfigRouter } from '@/server/presentation/trpc/routers/trakt-config.router';
import { createMdbListConfigRouter } from '@/server/presentation/trpc/routers/mdblist-config.router';
import { createProvidersRouter } from '@/server/presentation/trpc/routers/providers.router';
import { createAuthRouter } from '@/server/presentation/trpc/routers/auth.router';

// Instantiate containers
const listsContainer = new ListsContainer(db);
const processingContainer = new ProcessingContainer(db);
const dashboardContainer = new DashboardContainer(db);
const logsContainer = new LogsContainer();
const schedulerContainer = new SchedulerContainer();
const generalSettingsContainer = new GeneralSettingsContainer(db);
const jellyseerrConfigContainer = new JellyseerrConfigContainer(db);
const traktConfigContainer = new TraktConfigContainer(db);
const mdbListConfigContainer = new MdbListConfigContainer(db);
const authContainer = new AuthContainer(db);

// Build routers
export const listsRouter = createListsRouter(listsContainer);
export const processingRouter = createProcessingRouter(processingContainer);
export const dashboardRouter = createDashboardRouter(dashboardContainer);
export const logsRouter = createLogsRouter(logsContainer);
export const schedulerRouter = createSchedulerRouter(schedulerContainer);
export const generalSettingsRouter = createGeneralSettingsRouter(generalSettingsContainer);
export const jellyseerrConfigRouter = createJellyseerrConfigRouter(jellyseerrConfigContainer);
export const traktConfigRouter = createTraktConfigRouter(traktConfigContainer);
export const mdblistConfigRouter = createMdbListConfigRouter(mdbListConfigContainer);
export const providersRouter = createProvidersRouter({
  getTraktConfigUseCase: traktConfigContainer.getTraktConfigUseCase,
  getMdbListConfigUseCase: mdbListConfigContainer.getMdbListConfigUseCase,
});
export const authRouter = createAuthRouter(authContainer);

// Export processing container for scheduler integration
export { processingContainer };
