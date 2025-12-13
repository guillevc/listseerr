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
import { ProviderConfigContainer } from './di/provider-config-container';
import { GeneralSettingsContainer } from './di/general-settings-container';
import { JellyseerrConfigContainer } from './di/jellyseerr-config-container';

// Import router factories from presentation
import { createListsRouter } from '@/server/presentation/trpc/routers/lists.router';
import { createProcessingRouter } from '@/server/presentation/trpc/routers/processing.router';
import { createDashboardRouter } from '@/server/presentation/trpc/routers/dashboard.router';
import { createLogsRouter } from '@/server/presentation/trpc/routers/logs.router';
import { createSchedulerRouter } from '@/server/presentation/trpc/routers/scheduler.router';
import { createProviderConfigRouter } from '@/server/presentation/trpc/routers/provider-config.router';
import { createGeneralSettingsRouter } from '@/server/presentation/trpc/routers/general-settings.router';
import { createJellyseerrConfigRouter } from '@/server/presentation/trpc/routers/jellyseerr-config.router';

// Instantiate containers
const listsContainer = new ListsContainer(db);
const processingContainer = new ProcessingContainer(db);
const dashboardContainer = new DashboardContainer(db);
const logsContainer = new LogsContainer();
const schedulerContainer = new SchedulerContainer();
const providerConfigContainer = new ProviderConfigContainer(db);
const generalSettingsContainer = new GeneralSettingsContainer(db);
const jellyseerrConfigContainer = new JellyseerrConfigContainer(db);

// Build routers
export const listsRouter = createListsRouter(listsContainer);
export const processingRouter = createProcessingRouter(processingContainer);
export const dashboardRouter = createDashboardRouter(dashboardContainer);
export const logsRouter = createLogsRouter(logsContainer);
export const schedulerRouter = createSchedulerRouter(schedulerContainer);
export const providerConfigRouter = createProviderConfigRouter(providerConfigContainer);
export const generalSettingsRouter = createGeneralSettingsRouter(generalSettingsContainer);
export const jellyseerrConfigRouter = createJellyseerrConfigRouter(jellyseerrConfigContainer);

// Export processing container for scheduler integration
export { processingContainer };
