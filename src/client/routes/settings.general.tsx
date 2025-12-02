import { createRoute } from '@tanstack/react-router';
import { settingsRoute } from './settings';
import { GeneralSettings } from '../pages/settings/GeneralSettings';

export const settingsGeneralRoute = createRoute({
  getParentRoute: () => settingsRoute,
  path: '/general',
  component: GeneralSettings,
});
