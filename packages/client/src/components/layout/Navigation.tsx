import { useState, useMemo } from 'react';
import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import { Menu, ExternalLink, LogOut, ChevronRight } from 'lucide-react';
import { ThemeToggle } from '../ui/theme-toggle';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { cn } from '@/client/lib/utils';
import { trpc } from '@/client/lib/trpc';
import { JellyseerrStatusIndicator, StatusDot } from './JellyseerrStatusIndicator';
import { getUserFacingUrl } from 'shared/domain/logic/jellyseerr.logic';
import { useAuth } from '@/client/contexts/auth.context';

// Types
type JellyseerrStatus = 'connected' | 'error' | 'not-configured' | 'loading';

interface NavItem {
  name: string;
  path: string;
}

interface JellyseerrRequests {
  url: string;
  badge: string | number;
  isError: boolean;
}

// Hook
function useNavigation() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const { data: configData } = trpc.config.get.useQuery();
  const jellyseerrConfig = configData?.config;

  const { data: pendingRequests, isLoading: isPendingRequestsLoading } =
    trpc.dashboard.getPendingRequests.useQuery(undefined, {
      refetchInterval: 60000,
    });

  const jellyseerrStatus: JellyseerrStatus = useMemo(() => {
    if (isPendingRequestsLoading) return 'loading';
    if (!pendingRequests?.configured) return 'not-configured';
    if (pendingRequests?.error) return 'error';
    return 'connected';
  }, [pendingRequests, isPendingRequestsLoading]);

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/' },
    { name: 'Lists', path: '/lists' },
    { name: 'Settings', path: '/settings' },
    { name: 'Logs', path: '/logs' },
  ];

  const jellyseerrRequests: JellyseerrRequests | null =
    jellyseerrConfig?.url && pendingRequests?.configured
      ? {
          url: `${getUserFacingUrl(jellyseerrConfig)}/requests`,
          badge: pendingRequests?.error ? '!' : (pendingRequests?.count ?? 0),
          isError: !!pendingRequests?.error,
        }
      : null;

  const isActive = (path: string) =>
    path === '/' ? currentPath === '/' : currentPath.startsWith(path);

  return {
    navItems,
    isActive,
    jellyseerrStatus,
    jellyseerrUrl: jellyseerrConfig?.url,
    jellyseerrRequests,
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

function NavLink({
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
  return (
    <Button variant="ghost" size={mobile ? 'default' : 'sm'} active={isActive} asChild>
      <Link to={item.path} onClick={onClick}>
        {item.name}
      </Link>
    </Button>
  );
}

function JellyseerrSection({
  status,
  url,
  requests,
  onClick,
  mobile = false,
}: {
  status: JellyseerrStatus;
  url?: string;
  requests: JellyseerrRequests | null;
  onClick?: () => void;
  mobile?: boolean;
}) {
  const containerStyles = cn(
    'flex h-9 items-center gap-2 rounded-md bg-transparent px-3 text-sm',
    mobile && 'w-full'
  );

  // Show configure link when not configured
  if (status === 'not-configured') {
    return (
      <Link
        to="/settings/jellyseerr"
        onClick={onClick}
        className={cn(containerStyles, 'text-muted transition-colors hover:text-foreground')}
      >
        <span className={cn('flex justify-center', mobile && 'w-6')}>
          <StatusDot status={status} />
        </span>
        <span>Set up Jellyseerr</span>
        <ChevronRight className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <div className={cn('flex items-center gap-2', mobile && 'flex-col items-stretch')}>
      {/* Status indicator with label */}
      <JellyseerrStatusIndicator status={status} url={url} compact>
        <div className={cn(containerStyles, 'cursor-help')}>
          <span className={cn('flex justify-center', mobile && 'w-6')}>
            <StatusDot status={status} />
          </span>
          <span className="text-muted">Jellyseerr</span>
        </div>
      </JellyseerrStatusIndicator>

      {/* Requests link */}
      {requests && (
        <a
          href={requests.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          className={cn(containerStyles, 'text-muted transition-colors hover:text-foreground')}
        >
          <span className={cn('flex justify-center', mobile && 'w-6')}>
            <Badge
              variant="simple"
              className={cn(
                'px-1.5 py-0 text-xs',
                requests.isError ? 'bg-red-500/20 text-red-500' : 'bg-muted/20 text-muted'
              )}
            >
              {requests.badge}
            </Badge>
          </span>
          <span>Requests</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

function LogoutButton({ mobile = false, onClick }: { mobile?: boolean; onClick?: () => void }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    onClick?.();
    void logout().then(() => {
      void navigate({ to: '/login' });
    });
  };

  return (
    <Button
      variant="ghost"
      size={mobile ? 'default' : 'sm'}
      onClick={handleLogout}
      className={cn(mobile && 'w-full justify-start')}
    >
      <LogOut className="h-4 w-4" />
      {mobile && <span className="ml-2">Logout</span>}
    </Button>
  );
}

function DesktopNav({
  navItems,
  isActive,
}: {
  navItems: NavItem[];
  isActive: (path: string) => boolean;
}) {
  return (
    <div className="hidden gap-1 md:flex">
      {navItems.map((item) => (
        <NavLink key={item.path} item={item} isActive={isActive(item.path)} />
      ))}
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
  jellyseerrRequests,
}: {
  navItems: NavItem[];
  isActive: (path: string) => boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jellyseerrStatus: JellyseerrStatus;
  jellyseerrUrl?: string;
  jellyseerrRequests: JellyseerrRequests | null;
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
            <NavLink
              key={item.path}
              item={item}
              isActive={isActive(item.path)}
              onClick={closeMenu}
              mobile
            />
          ))}
          <JellyseerrSection
            status={jellyseerrStatus}
            url={jellyseerrUrl}
            requests={jellyseerrRequests}
            onClick={closeMenu}
            mobile
          />
          <div className="mt-4 border-t pt-4">
            <LogoutButton mobile onClick={closeMenu} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Main Component
export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { navItems, isActive, jellyseerrStatus, jellyseerrUrl, jellyseerrRequests } =
    useNavigation();

  return (
    <nav className="border-b">
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo + Desktop Nav */}
          <div className="flex items-center gap-8">
            <Logo />
            <DesktopNav navItems={navItems} isActive={isActive} />
          </div>

          {/* Right: Jellyseerr + Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <JellyseerrSection
                status={jellyseerrStatus}
                url={jellyseerrUrl}
                requests={jellyseerrRequests}
              />
            </div>
            <ThemeToggle />
            <div className="hidden md:block">
              <LogoutButton />
            </div>
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
        jellyseerrRequests={jellyseerrRequests}
      />
    </nav>
  );
}
