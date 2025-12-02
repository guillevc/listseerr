import { createRoute } from '@tanstack/react-router';
import { settingsRoute } from './settings';
import { JellyseerrSettings } from '../pages/settings/JellyseerrSettings';

export const settingsJellyseerrRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/jellyseerr',
  component: JellyseerrSettings,
});
