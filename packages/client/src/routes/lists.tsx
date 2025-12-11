import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './__root';
import { ListsPage } from '../pages/ListsPage';

export const listsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lists',
  component: ListsPage,
});
