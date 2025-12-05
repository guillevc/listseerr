import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Menu, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '../ui/theme-toggle';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { cn } from '@/client/lib/utils';
import { trpc } from '@/client/lib/trpc';

export function Navigation() {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Query Jellyseerr config for requests link
  const { data: jellyseerrConfig } = trpc.config.get.useQuery();
  const jellyseerrRequestsUrl = jellyseerrConfig?.url
    ? `${jellyseerrConfig.url}/requests`
    : undefined;
  const mockPendingRequests = 5; // TODO: Replace with real count later

  // Dynamic nav items including external links
  const navItems = [
    { name: 'Dashboard', path: '/', type: 'internal' },
    { name: 'Lists', path: '/lists', type: 'internal' },
    { name: 'Settings', path: '/settings', type: 'internal' },
    { name: 'Logs', path: '/logs', type: 'internal' },
    {
      name: 'Requests',
      path: jellyseerrRequestsUrl,
      type: 'external',
      badge: mockPendingRequests,
      disabled: !jellyseerrRequestsUrl,
    },
  ];

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3h18v18H3z" />
                <path d="M7 7h10v10H7z" />
                <path d="M12 7v10" />
                <path d="M7 12h10" />
              </svg>
              <span className="text-xl font-bold">Listseerr</span>
            </Link>

            {/* Nav Tabs */}
            <div className="hidden md:flex gap-1">
              {navItems.map((item) => {
                const isActive = item.type === 'internal' && item.path && (
                  item.path === '/'
                    ? currentPath === '/'
                    : currentPath.startsWith(item.path)
                );

                if (item.disabled) {
                  return (
                    <div
                      key={item.path || item.name}
                      className="px-4 py-2 text-sm text-muted-foreground/50 cursor-not-allowed"
                    >
                      {item.name}
                    </div>
                  );
                }

                if (item.type === 'external' && item.path) {
                  return (
                    <Button
                      key={item.path}
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={item.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 border-flexoki-purple text-flexoki-purple hover:bg-flexoki-purple/10"
                      >
                        {item.badge && (
                          <Badge className="px-1.5 py-0 text-xs bg-flexoki-purple text-black hover:bg-flexoki-purple/90">
                            {item.badge}
                          </Badge>
                        )}
                        {item.name}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} modal={false}>
        <SheetContent side="left" className="w-64">
          <SheetHeader>
            <SheetTitle className="text-left">Menu</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 mt-6">
            {navItems.map((item) => {
              const isActive = item.type === 'internal' && item.path && (
                item.path === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(item.path)
              );

              if (item.disabled) {
                return (
                  <div
                    key={item.path || item.name}
                    className="px-4 py-3 text-sm text-muted-foreground/50 cursor-not-allowed rounded-md"
                  >
                    {item.name}
                  </div>
                );
              }

              if (item.type === 'external' && item.path) {
                return (
                  <Button
                    key={item.path}
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 w-full border-flexoki-purple text-flexoki-purple hover:bg-flexoki-purple/10"
                    >
                      {item.badge && (
                        <Badge className="px-1.5 py-0 text-xs bg-flexoki-purple text-white hover:bg-flexoki-purple/90">
                          {item.badge}
                        </Badge>
                      )}
                      {item.name}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-3 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
