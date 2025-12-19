import { Outlet, useRouterState, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Toaster } from '../ui/toaster';
import { AppLayout } from './AppLayout';
import { useAuth } from '../../hooks/use-auth';
import { trpc } from '../../lib/trpc';

export function RootComponent() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouterState();
  const currentPath = router.location.pathname;

  // Check setup status
  const { data: setupStatus, isLoading: setupLoading } = trpc.auth.checkSetupStatus.useQuery();

  const isAuthRoute = currentPath === '/login' || currentPath === '/register';
  const needsSetup = setupStatus?.needsSetup ?? false;
  const isLoading = authLoading || setupLoading;

  useEffect(() => {
    if (isLoading) return;

    // If needs setup and not on register page, redirect to register
    if (needsSetup && currentPath !== '/register') {
      void navigate({ to: '/register' });
      return;
    }

    // If no setup needed but on register page, redirect to login (or dashboard if auth'd)
    if (!needsSetup && currentPath === '/register') {
      void navigate({ to: isAuthenticated ? '/' : '/login' });
      return;
    }

    // If authenticated and on login page, redirect to dashboard
    if (isAuthenticated && currentPath === '/login') {
      void navigate({ to: '/' });
      return;
    }

    // If not authenticated and not on auth route, redirect to login
    if (!isAuthenticated && !isAuthRoute && !needsSetup) {
      void navigate({ to: '/login' });
    }
  }, [isLoading, needsSetup, isAuthenticated, currentPath, isAuthRoute, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  // Auth routes render without AppLayout
  if (isAuthRoute) {
    return (
      <div className="min-h-screen">
        <Toaster />
        <Outlet />
      </div>
    );
  }

  // Protected routes render with AppLayout
  return (
    <div className="min-h-screen">
      <Toaster />
      <AppLayout>
        <Outlet />
      </AppLayout>
    </div>
  );
}
