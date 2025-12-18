import { useState, useMemo } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { Menu, ExternalLink } from 'lucide-react';
import { ThemeToggle } from '../ui/theme-toggle';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { cn } from '@/client/lib/utils';
import { trpc } from '@/client/lib/trpc';
import { JellyseerrStatusIndicator } from './JellyseerrStatusIndicator';
import { getUserFacingUrl } from 'shared/domain/logic/jellyseerr.logic';

// Types
type JellyseerrStatus = 'connected' | 'error' | 'not-configured' | 'loading';

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
    ? `${getUserFacingUrl(jellyseerrConfig)}/requests`
    : undefined;

  const { data: pendingRequests, isLoading: isPendingRequestsLoading } =
    trpc.dashboard.getPendingRequests.useQuery(undefined, {
      refetchInterval: 60000,
    });

  // Derive Jellyseerr connection status from pending requests query
  const jellyseerrStatus = useMemo(() => {
    if (isPendingRequestsLoading) return 'loading' as const;
    if (!pendingRequests?.configured) return 'not-configured' as const;
    if (pendingRequests?.error) return 'error' as const;
    return 'connected' as const;
  }, [pendingRequests, isPendingRequestsLoading]);

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', type: 'internal' },
    { name: 'Lists', path: '/lists', type: 'internal' },
    { name: 'Settings', path: '/settings', type: 'internal' },
    { name: 'Logs', path: '/logs', type: 'internal' },
  ];

  const requestsItem: ExternalNavItem | null = jellyseerrRequestsUrl
    ? {
        name: 'Pending requests',
        path: jellyseerrRequestsUrl,
        type: 'external' as const,
        badge: pendingRequests?.error ? '!' : pendingRequests?.count || '0',
        disabled: !pendingRequests?.configured,
      }
    : null;

  const isActive = (item: NavItem) =>
    item.type === 'internal' &&
    (item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path));

  return {
    navItems,
    isActive,
    jellyseerrStatus,
    jellyseerrUrl: jellyseerrConfig?.url,
    requestsItem,
  };
}

// Components
function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <img src="/assets/listseerr-light.png" alt="Listseerr" className="h-8 w-8 dark:hidden" />
      <img src="/assets/listseerr-dark.png" alt="Listseerr" className="hidden h-8 w-8 dark:block" />
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

function JellyseerrSection({
  status,
  url,
  requestsItem,
  onClick,
  mobile = false,
}: {
  status: JellyseerrStatus;
  url?: string;
  requestsItem: ExternalNavItem | null;
  onClick?: () => void;
  mobile?: boolean;
}) {
  const containerStyles = cn(
    'flex h-9 items-center gap-2 rounded-md border-2 border-border bg-transparent px-3 text-sm',
    mobile && 'w-full'
  );

  return (
    <div className={cn('flex items-center gap-2', mobile && 'flex-col items-stretch')}>
      {/* Status indicator with label */}
      <div className={containerStyles}>
        <JellyseerrStatusIndicator status={status} url={url} compact />
        <span className="text-muted">Jellyseerr</span>
      </div>

      {/* Requests link (only when configured) */}
      {requestsItem && !requestsItem.disabled && (
        <a
          href={requestsItem.path}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className={cn(containerStyles, 'text-muted transition-colors hover:border-muted')}
        >
          <Badge variant="simple" className="bg-muted/20 px-1.5 py-0 text-xs text-muted">
            {requestsItem.badge}
          </Badge>
          <span>{requestsItem.name}</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

function DesktopNav({
  navItems,
  isActive,
  jellyseerrStatus,
  jellyseerrUrl,
  requestsItem,
}: {
  navItems: NavItem[];
  isActive: (item: NavItem) => boolean;
  jellyseerrStatus: JellyseerrStatus;
  jellyseerrUrl?: string;
  requestsItem: ExternalNavItem | null;
}) {
  return (
    <div className="hidden gap-1 md:flex">
      {navItems.map((item) => (
        <NavItemRenderer key={item.path} item={item} isActive={isActive(item)} />
      ))}
      <JellyseerrSection
        status={jellyseerrStatus}
        url={jellyseerrUrl}
        requestsItem={requestsItem}
      />
    </div>
  );
}

function MobileNav({
  navItems,
  isActive,
  open,
  onOpenChange,
  jellyseerrStatus,
  jellyseerrUrl,
  requestsItem,
}: {
  navItems: NavItem[];
  isActive: (item: NavItem) => boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jellyseerrStatus: JellyseerrStatus;
  jellyseerrUrl?: string;
  requestsItem: ExternalNavItem | null;
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
          <JellyseerrSection
            status={jellyseerrStatus}
            url={jellyseerrUrl}
            requestsItem={requestsItem}
            onClick={closeMenu}
            mobile
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Main Component
export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { navItems, isActive, jellyseerrStatus, jellyseerrUrl, requestsItem } = useNavigation();

  return (
    <nav className="border-b">
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo + Desktop Nav */}
          <div className="flex items-center gap-8">
            <Logo />
            <DesktopNav
              navItems={navItems}
              isActive={isActive}
              jellyseerrStatus={jellyseerrStatus}
              jellyseerrUrl={jellyseerrUrl}
              requestsItem={requestsItem}
            />
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
        jellyseerrStatus={jellyseerrStatus}
        jellyseerrUrl={jellyseerrUrl}
        requestsItem={requestsItem}
      />
    </nav>
  );
}
