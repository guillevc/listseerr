import { createRoute } from '@tanstack/react-router';
import { settingsRoute } from './settings';
import { SeerrSettings } from '../pages/settings/SeerrSettings';

// @ts-expect-error - TanStack Router circular type inference limitation
export const settingsSeerrRoute = createRoute({
  // @ts-expect-error - TanStack Router circular type inference limitation
  getParentRoute: () => settingsRoute,
  path: '/seerr',
  component: SeerrSettings,
});
