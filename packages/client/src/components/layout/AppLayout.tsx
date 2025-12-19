import { Navigation } from './Navigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <main className="container mx-auto max-w-6xl flex-1 p-4 md:p-8">{children}</main>
      <footer className="flex items-center justify-center gap-1.5 border-t py-4 font-mono text-sm text-muted">
        <a
          href={`https://github.com/guillevc/listseerr/releases/tag/v${__APP_VERSION__}`}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          v{__APP_VERSION__}
        </a>
        <span>·</span>
        <a
          href={`https://github.com/guillevc/listseerr/commit/${__COMMIT_HASH__}`}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          #{__COMMIT_HASH__.slice(0, 7)}
        </a>
        <span>·</span>
        <a
          href="https://stephango.com/flexoki"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          Colors by Flexoki
        </a>
      </footer>
    </div>
  );
}
