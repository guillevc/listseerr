export function Footer() {
  return (
    <footer className="flex items-center justify-center gap-1.5 border-t py-3 font-mono text-xs text-muted">
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
  );
}
