import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { settingsIndexRoute } from './settings.index';
import { settingsJellyseerrRoute } from './settings.jellyseerr';
import { settingsApiKeysRoute } from './settings.api-keys';
import { settingsSyncScheduleRoute } from './settings.sync-schedule';

export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
}).addChildren([
  settingsIndexRoute,
  settingsJellyseerrRoute,
  settingsApiKeysRoute,
  settingsSyncScheduleRoute,
]);
