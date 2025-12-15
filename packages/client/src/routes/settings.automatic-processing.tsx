import { createRoute } from '@tanstack/react-router';
import { settingsRoute } from './settings';
import { ProcessingScheduleSettings } from '../pages/settings/ProcessingScheduleSettings';

// @ts-expect-error - TanStack Router circular type inference limitation
export const settingsAutomaticProcessingRoute = createRoute({
  // @ts-expect-error - TanStack Router circular type inference limitation
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  getParentRoute: () => settingsRoute,
  path: '/automatic-processing',
  component: ProcessingScheduleSettings,
});
