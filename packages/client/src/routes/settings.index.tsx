import { createRoute, redirect } from '@tanstack/react-router';
import { settingsRoute } from './settings';

// @ts-expect-error - TanStack Router circular type inference limitation
export const settingsIndexRoute = createRoute({
  // @ts-expect-error - TanStack Router circular type inference limitation
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  getParentRoute: () => settingsRoute,
  path: '/',
  beforeLoad: () => {
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw redirect({
      to: '/settings/general',
    });
  },
});
