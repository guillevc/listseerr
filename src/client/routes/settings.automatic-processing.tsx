import { createRoute } from '@tanstack/react-router';
import { settingsRoute } from './settings';
import { ProcessingScheduleSettings } from '../pages/settings/ProcessingScheduleSettings';

export const settingsAutomaticProcessingRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/automatic-processing',
  component: ProcessingScheduleSettings,
});
