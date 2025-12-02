import { createRoute } from '@tanstack/react-router';
import { settingsRoute } from './settings';
import { SyncScheduleSettings } from '../pages/settings/SyncScheduleSettings';

export const settingsAutomaticSyncRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/automatic-sync',
  component: SyncScheduleSettings,
});
