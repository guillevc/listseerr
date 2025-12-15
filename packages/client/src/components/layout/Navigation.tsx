import { useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Menu, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '../ui/theme-toggle';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { cn } from '@/client/lib/utils';
import { trpc } from '@/client/lib/trpc';

// Types
interface BaseNavItem {
  name: string;
  path: string;
}

interface InternalNavItem extends BaseNavItem {
  type: 'internal';
}

interface ExternalNavItem extends BaseNavItem {
  type: 'external';
  badge?: string | number;
  disabled?: boolean;
}

type NavItem = InternalNavItem | ExternalNavItem;

// Hooks
function useNavigation() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const { data: configData } = trpc.config.get.useQuery();
  const jellyseerrConfig = configData?.config;
  const jellyseerrRequestsUrl = jellyseerrConfig?.url
    ? `${jellyseerrConfig.url}/requests`
    : undefined;

  const { data: pendingRequests } = trpc.dashboard.getPendingRequests.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', type: 'internal' },
    { name: 'Lists', path: '/lists', type: 'internal' },
    { name: 'Settings', path: '/settings', type: 'internal' },
    { name: 'Logs', path: '/logs', type: 'internal' },
    ...(jellyseerrRequestsUrl
      ? [
          {
            name: 'Requests',
            path: jellyseerrRequestsUrl,
            type: 'external' as const,
            badge: pendingRequests?.error ? '!' : pendingRequests?.count || '0',
            disabled: !pendingRequests?.configured,
          },
        ]
      : []),
  ];

  const isActive = (item: NavItem) =>
    item.type === 'internal' &&
    (item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path));

  return { navItems, isActive };
}

// Components
function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <svg
        viewBox="0 0 24 24"
        className="text-light-primary dark:text-dark-primary h-8 w-8"
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
  );
}

function InternalLink({
  item,
  isActive,
  onClick,
  mobile = false,
}: {
  item: InternalNavItem;
  isActive: boolean;
  onClick?: () => void;
  mobile?: boolean;
}) {
  return (
    <Button variant="ghost" size={mobile ? 'default' : 'sm'} active={isActive} asChild>
      <Link to={item.path} onClick={onClick}>
        {item.name}
      </Link>
    </Button>
  );
}

function ExternalLinkButton({
  item,
  onClick,
  mobile = false,
}: {
  item: ExternalNavItem;
  onClick?: () => void;
  mobile?: boolean;
}) {
  if (item.disabled) {
    return (
      <div
        className={cn(
          'cursor-not-allowed text-sm text-muted',
          mobile ? 'rounded-md px-4 py-3' : 'px-4 py-2'
        )}
      >
        {item.name}
      </div>
    );
  }

  const badgeClass =
    item.badge === '!'
      ? 'bg-light-re dark:bg-dark-re text-foreground hover:bg-light-re-2 hover:dark:bg-dark-re-2'
      : mobile
        ? 'bg-light-pu dark:bg-dark-pu text-foreground hover:bg-light-pu-2 hover:dark:bg-dark-pu-2'
        : 'bg-light-pu-2 dark:bg-dark-pu-2 text-paper';

  return (
    <Button variant="outline" accent="purple" size="sm" asChild>
      <a
        href={item.path}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={cn('flex items-center gap-2', mobile && 'w-full')}
      >
        {item.badge && (
          <Badge variant="simple" className={cn('px-1.5 py-0 text-xs', badgeClass)}>
            {item.badge}
          </Badge>
        )}
        {item.name}
        <ExternalLink className="h-3 w-3" />
      </a>
    </Button>
  );
}

function NavItemRenderer({
  item,
  isActive,
  onClick,
  mobile = false,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
  mobile?: boolean;
}) {
  if (item.type === 'external') {
    return <ExternalLinkButton item={item} onClick={onClick} mobile={mobile} />;
  }
  return <InternalLink item={item} isActive={isActive} onClick={onClick} mobile={mobile} />;
}

function DesktopNav({
  navItems,
  isActive,
}: {
  navItems: NavItem[];
  isActive: (item: NavItem) => boolean;
}) {
  return (
    <div className="hidden gap-1 md:flex">
      {navItems.map((item) => (
        <NavItemRenderer key={item.path} item={item} isActive={isActive(item)} />
      ))}
    </div>
  );
}

function MobileNav({
  navItems,
  isActive,
  open,
  onOpenChange,
}: {
  navItems: NavItem[];
  isActive: (item: NavItem) => boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const closeMenu = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavItemRenderer
              key={item.path}
              item={item}
              isActive={isActive(item)}
              onClick={closeMenu}
              mobile
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Main Component
export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { navItems, isActive } = useNavigation();

  return (
    <nav className="border-b">
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo + Desktop Nav */}
          <div className="flex items-center gap-8">
            <Logo />
            <DesktopNav navItems={navItems} isActive={isActive} />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
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

      {/* Mobile Nav */}
      <MobileNav
        navItems={navItems}
        isActive={isActive}
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />
    </nav>
  );
}
