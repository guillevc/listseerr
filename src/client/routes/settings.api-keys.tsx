import { createRoute } from '@tanstack/react-router';
import { settingsRoute } from './settings';
import { ApiKeysSettings } from '../pages/settings/ApiKeysSettings';

export const settingsApiKeysRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/api-keys',
  component: ApiKeysSettings,
});
