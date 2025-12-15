import { createRoute, redirect } from '@tanstack/react-router';
import { settingsRoute } from './settings';

// @ts-expect-error - TanStack Router circular type inference limitation
export const settingsIndexRoute = createRoute({
  // @ts-expect-error - TanStack Router circular type inference limitation
  getParentRoute: () => settingsRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({
      to: '/settings/general',
    });
  },
});
