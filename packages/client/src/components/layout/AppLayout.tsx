import { Navigation } from './Navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="container mx-auto max-w-6xl flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
