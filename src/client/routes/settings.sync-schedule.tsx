import { createRoute } from '@tanstack/react-router';
import { settingsRoute } from './settings';
import { SyncScheduleSettings } from '../pages/settings/SyncScheduleSettings';

export const settingsSyncScheduleRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/sync-schedule',
  component: SyncScheduleSettings,
});
