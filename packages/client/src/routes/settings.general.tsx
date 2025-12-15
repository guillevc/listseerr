import { createRoute } from '@tanstack/react-router';
import { settingsRoute } from './settings';
import { GeneralSettings } from '../pages/settings/GeneralSettings';

// @ts-expect-error - TanStack Router circular type inference limitation
export const settingsGeneralRoute = createRoute({
  // @ts-expect-error - TanStack Router circular type inference limitation
  getParentRoute: () => settingsRoute,
  path: '/general',
  component: GeneralSettings,
});
