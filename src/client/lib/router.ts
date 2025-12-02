import { createRouter } from '@tanstack/react-router';
import { rootRoute } from '../routes/__root';
import { dashboardRoute } from '../routes/dashboard';
import { listsRoute } from '../routes/lists';
import { settingsRoute } from '../routes/settings';

// Create the route tree
const routeTree = rootRoute.addChildren([
  dashboardRoute,
  listsRoute,
  settingsRoute,
]);

// Create and export the router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
