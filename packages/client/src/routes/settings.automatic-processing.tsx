import { createRoute } from '@tanstack/react-router';
import { settingsRoute } from './settings';
import { ProcessingScheduleSettings } from '../pages/settings/ProcessingScheduleSettings';

// @ts-expect-error - TanStack Router circular type inference limitation
export const settingsAutomaticProcessingRoute = createRoute({
  // @ts-expect-error - TanStack Router circular type inference limitation
  getParentRoute: () => settingsRoute,
  path: '/automatic-processing',
  component: ProcessingScheduleSettings,
});
