import { Navigation } from './Navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="container mx-auto max-w-6xl flex-1 p-4 md:p-8">{children}</main>
      <footer className="border-t py-2 text-center font-mono text-xs text-muted">
        v{__APP_VERSION__} · {__COMMIT_HASH__.slice(0, 7)} ·{' '}
        <a
          href="https://stephango.com/flexoki"
          target="_blank"
          rel="noopener noreferrer"
          className="underline transition-colors hover:text-foreground"
        >
          Colors by Flexoki
        </a>
      </footer>
    </div>
  );
}
