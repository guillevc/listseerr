import { createRoute, redirect } from '@tanstack/react-router';
import { settingsRoute } from './settings';

export const settingsIndexRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({
      to: '/settings/jellyseerr',
    });
  },
});
