import { createRoute } from '@tanstack/react-router';
import { settingsRoute } from './settings';
import { JellyseerrSettings } from '../pages/settings/JellyseerrSettings';

// @ts-expect-error - TanStack Router circular type inference limitation
export const settingsJellyseerrRoute = createRoute({
  // @ts-expect-error - TanStack Router circular type inference limitation
  getParentRoute: () => settingsRoute,
  path: '/jellyseerr',
  component: JellyseerrSettings,
});
