import { createRoute } from '@tanstack/react-router';
import { settingsRoute } from './settings';
import { ApiKeysSettings } from '../pages/settings/ApiKeysSettings';

// @ts-expect-error - TanStack Router circular type inference limitation
export const settingsApiKeysRoute = createRoute({
  // @ts-expect-error - TanStack Router circular type inference limitation
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  getParentRoute: () => settingsRoute,
  path: '/api-keys',
  component: ApiKeysSettings,
});
