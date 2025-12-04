import { createRoute } from '@tanstack/react-router';
import { settingsRoute } from './settings';
import { ApiKeysSettings } from '../pages/settings/ApiKeysSettings';

// @ts-expect-error - TanStack Router circular type inference limitation
export const settingsApiKeysRoute = createRoute({
  // @ts-expect-error - TanStack Router circular type inference limitation
  getParentRoute: () => settingsRoute,
  path: '/api-keys',
  component: ApiKeysSettings,
});
