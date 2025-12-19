import { useState, useMemo } from 'react';
import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import { Menu, LogOut, ChevronRight, User, Settings } from 'lucide-react';

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
import { ThemeToggle } from '../ui/theme-toggle';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/client/lib/utils';
import { trpc } from '@/client/lib/trpc';
import { JellyseerrStatusIndicator, StatusDot } from './JellyseerrStatusIndicator';
import { getUserFacingUrl } from 'shared/domain/logic/jellyseerr.logic';
import { useAuth } from '@/client/hooks/use-auth';

// Types
type JellyseerrStatus = 'connected' | 'error' | 'not-configured' | 'loading';

interface NavItem {
  name: string;
  path: string;
}

interface JellyseerrRequests {
  url: string;
  badge: number | null;
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
          badge: pendingRequests?.error ? null : (pendingRequests?.count ?? 0),
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
  // Show configure link when not configured
  if (status === 'not-configured') {
    return (
      <Button
        variant="ghost"
        size={mobile ? 'default' : 'sm'}
        asChild
        className={cn(mobile && 'w-full justify-start')}
      >
        <Link to="/settings/jellyseerr" onClick={onClick}>
          <StatusDot status={status} />
          <span>Set up Jellyseerr</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <JellyseerrStatusIndicator status={status} url={url} pendingRequests={requests?.badge} compact>
      <Button
        variant="outline"
        accent="purple"
        size={mobile ? 'default' : 'sm'}
        asChild
        className={cn(mobile && 'w-full justify-start')}
      >
        <a href={requests?.url ?? url} target="_blank" rel="noopener noreferrer" onClick={onClick}>
          {status === 'connected' ? (
            <Badge
              variant="simple"
              className="gap-1 bg-card px-1.5 py-0.5 text-xs font-medium text-foreground"
            >
              <StatusDot status={status} />
              {requests?.badge != null && requests.badge > 0 && requests.badge}
            </Badge>
          ) : (
            <StatusDot status={status} />
          )}
          <span>Jellyseerr</span>
        </a>
      </Button>
    </JellyseerrStatusIndicator>
  );
}

function UserDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    void logout().then(() => {
      void navigate({ to: '/login' });
    });
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <span>{user?.username}</span>
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/settings/account">
            <User className="mr-2 h-4 w-4" />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings/general">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const closeMenu = () => onOpenChange(false);

  const handleLogout = () => {
    closeMenu();
    void logout().then(() => {
      void navigate({ to: '/login' });
    });
  };

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
          <div className="mt-4 flex flex-col gap-2 border-t pt-4">
            <div className="px-3 py-2 text-sm font-medium text-muted">{user?.username}</div>
            <Button
              variant="ghost"
              size="default"
              asChild
              className="w-full justify-start"
              onClick={closeMenu}
            >
              <Link to="/settings/account">
                <User className="mr-2 h-4 w-4" />
                Account
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="default"
              asChild
              className="w-full justify-start"
              onClick={closeMenu}
            >
              <Link to="/settings/general">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="default"
              onClick={handleLogout}
              className="w-full justify-start"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex">
                    <a
                      href="https://github.com/guillevc/listseerr"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub repository"
                    >
                      <GitHubIcon className="h-4 w-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View on GitHub</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="hidden md:block">
              <JellyseerrSection
                status={jellyseerrStatus}
                url={jellyseerrUrl}
                requests={jellyseerrRequests}
              />
            </div>
            <ThemeToggle />
            <div className="hidden md:block">
              <UserDropdown />
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
