import { useAuth } from '@/client/hooks/use-auth';
import { trpc } from '@/client/lib/trpc';
import { cn } from '@/client/lib/utils';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { ChevronRight, LogOut, Menu, Settings, Star, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getUserFacingUrl } from 'shared/domain/logic';
import { SeerrStatusIndicator, StatusDot } from '../common/SeerrStatusIndicator';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { ThemeToggle } from '../ui/theme-toggle';

// Types
type SeerrStatus = 'connected' | 'error' | 'not-configured' | 'loading';

interface NavItem {
  name: string;
  path: string;
}

interface SeerrRequests {
  url: string;
  badge: number | null;
  isError: boolean;
}

// Hook
function useNavigation() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const { data: configData } = trpc.config.get.useQuery();
  const seerrConfig = configData?.config;

  const { data: pendingRequests, isLoading: isPendingRequestsLoading } =
    trpc.dashboard.getPendingRequests.useQuery(undefined, {
      refetchInterval: 60000,
    });

  const seerrStatus: SeerrStatus = useMemo(() => {
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

  const seerrRequests: SeerrRequests | null =
    seerrConfig?.url && pendingRequests?.configured
      ? {
          url: `${getUserFacingUrl(seerrConfig)}/requests`,
          badge: pendingRequests?.error ? null : (pendingRequests?.count ?? 0),
          isError: !!pendingRequests?.error,
        }
      : null;

  const isActive = (path: string) =>
    path === '/' ? currentPath === '/' : currentPath.startsWith(path);

  return {
    navItems,
    isActive,
    seerrStatus,
    seerrUrl: seerrConfig?.url,
    seerrRequests,
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

function SeerrSection({
  status,
  url,
  requests,
  onClick,
  mobile = false,
}: {
  status: SeerrStatus;
  url?: string;
  requests: SeerrRequests | null;
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
        <Link to="/settings/seerr" onClick={onClick}>
          <StatusDot status={status} />
          <span>Set up Seerr</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <SeerrStatusIndicator status={status} url={url} pendingRequests={requests?.badge} compact>
      <Button
        variant="outline"
        accent="purple"
        size={mobile ? 'default' : 'sm'}
        asChild
        className={cn(mobile && 'w-full justify-start')}
      >
        <a href={requests?.url ?? url} target="_blank" rel="noopener noreferrer" onClick={onClick}>
          {status === 'connected' && requests?.badge != null && requests.badge > 0 ? (
            <Badge
              variant="simple"
              className="gap-1 bg-card px-1.5 py-0.5 text-xs font-medium text-foreground"
            >
              <StatusDot status={status} />
              {requests.badge}
            </Badge>
          ) : (
            <StatusDot status={status} />
          )}
          <span>Seerr</span>
        </a>
      </Button>
    </SeerrStatusIndicator>
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
  seerrStatus,
  seerrUrl,
  seerrRequests,
}: {
  navItems: NavItem[];
  isActive: (path: string) => boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seerrStatus: SeerrStatus;
  seerrUrl?: string;
  seerrRequests: SeerrRequests | null;
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
          <SeerrSection
            status={seerrStatus}
            url={seerrUrl}
            requests={seerrRequests}
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
          <div className="mt-4 border-t pt-4">
            <Button
              variant="ghost"
              size="default"
              asChild
              className="w-full justify-start"
              onClick={closeMenu}
            >
              <a
                href="https://github.com/guillevc/listseerr"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Star className="mr-2 h-4 w-4 fill-ye text-ye" strokeWidth={1} />
                Star on GitHub
              </a>
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
  const { navItems, isActive, seerrStatus, seerrUrl, seerrRequests } = useNavigation();

  return (
    <nav className="border-b">
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo + Desktop Nav */}
          <div className="flex items-center gap-8">
            <Logo />
            <DesktopNav navItems={navItems} isActive={isActive} />
          </div>

          {/* Right: Seerr + Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="hidden md:inline-flex">
              <a
                href="https://github.com/guillevc/listseerr"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Star className="h-4 w-4 fill-ye text-ye" strokeWidth={1} />
                <span className="text-foreground">Star on GitHub</span>
              </a>
            </Button>
            <div className="hidden md:block">
              <SeerrSection status={seerrStatus} url={seerrUrl} requests={seerrRequests} />
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
        seerrStatus={seerrStatus}
        seerrUrl={seerrUrl}
        seerrRequests={seerrRequests}
      />
    </nav>
  );
}
