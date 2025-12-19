import { createRootRoute } from '@tanstack/react-router';
import { RootComponent } from '../components/layout/RootComponent';

export const rootRoute = createRootRoute({
  component: RootComponent,
});
