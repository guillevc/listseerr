import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { ThemeProvider } from './components/ui/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './lib/trpc';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './lib/router';
import { AuthProvider } from './contexts/auth.context';

export function Root() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/trpc',
        }),
      ],
    })
  );

  return (
    <StrictMode>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(<Root />);
