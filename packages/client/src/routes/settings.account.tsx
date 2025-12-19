import { createRoute } from '@tanstack/react-router';
import { settingsRoute } from './settings';
import { AccountSettings } from '../pages/settings/AccountSettings';

// @ts-expect-error - TanStack Router circular type inference limitation
export const settingsAccountRoute = createRoute({
  // @ts-expect-error - TanStack Router circular type inference limitation
  getParentRoute: () => settingsRoute,
  path: '/account',
  component: AccountSettings,
});
