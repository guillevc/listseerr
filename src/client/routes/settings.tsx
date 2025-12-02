import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { settingsIndexRoute } from './settings.index';
import { settingsGeneralRoute } from './settings.general';
import { settingsJellyseerrRoute } from './settings.jellyseerr';
import { settingsApiKeysRoute } from './settings.api-keys';
import { settingsAutomaticSyncRoute } from './settings.automatic-sync';

export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
}).addChildren([
  settingsIndexRoute,
  settingsGeneralRoute,
  settingsJellyseerrRoute,
  settingsApiKeysRoute,
  settingsAutomaticSyncRoute,
]);
