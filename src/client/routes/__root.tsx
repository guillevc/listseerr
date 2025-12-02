import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '../components/ui/toaster';
import { AppLayout } from '../components/layout/AppLayout';

export const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background">
      <Toaster />
      <AppLayout>
        <Outlet />
      </AppLayout>
    </div>
  ),
});
