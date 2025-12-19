import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { settingsIndexRoute } from './settings.index';
import { settingsAccountRoute } from './settings.account';
import { settingsGeneralRoute } from './settings.general';
import { settingsJellyseerrRoute } from './settings.jellyseerr';
import { settingsApiKeysRoute } from './settings.api-keys';
import { settingsAutomaticProcessingRoute } from './settings.automatic-processing';

// @ts-expect-error - TanStack Router circular type inference limitation
export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
}).addChildren([
  settingsIndexRoute,
  settingsAccountRoute,
  settingsGeneralRoute,
  settingsJellyseerrRoute,
  settingsApiKeysRoute,
  settingsAutomaticProcessingRoute,
]);
