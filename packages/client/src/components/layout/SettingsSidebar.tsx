import { Settings, Key, Clock, SlidersHorizontal, AlertCircle, User } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/client/lib/utils';
import { trpc } from '../../lib/trpc';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface SettingsCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  path: string;
}

const settingsCategories: SettingsCategory[] = [
  {
    id: 'general',
    name: 'General',
    icon: <SlidersHorizontal className="h-4 w-4" />,
    path: '/settings/general',
  },
  {
    id: 'jellyseerr',
    name: 'Jellyseerr',
    icon: <Settings className="h-4 w-4" />,
    path: '/settings/jellyseerr',
  },
  {
    id: 'api-keys',
    name: 'API Keys',
    icon: <Key className="h-4 w-4" />,
    path: '/settings/api-keys',
  },
  {
    id: 'automatic-processing',
    name: 'Automatic Processing',
    icon: <Clock className="h-4 w-4" />,
    path: '/settings/automatic-processing',
  },
  {
    id: 'account',
    name: 'Account',
    icon: <User className="h-4 w-4" />,
    path: '/settings/account',
  },
];

interface SettingsSidebarProps {
  activeCategory?: string;
}

export function SettingsSidebar({ activeCategory = 'general' }: SettingsSidebarProps) {
  const { data: configData, isLoading } = trpc.config.get.useQuery();
  const jellyseerrConfigured = isLoading || !!configData?.config;

  return (
    <aside className="w-full md:w-64">
      <nav className="space-y-1 p-2">
        {settingsCategories.map((category) => {
          const isActive = category.id === activeCategory;
          const needsAttention = category.id === 'jellyseerr' && !jellyseerrConfigured;

          return (
            <Link
              key={category.id}
              to={category.path}
              className={cn(
                'flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-2.5 text-left text-sm font-medium transition-colors',
                isActive
                  ? 'border-input bg-background/70 text-foreground dark:bg-background/50'
                  : 'text-muted hover:bg-card/50 hover:text-foreground'
              )}
            >
              {category.icon}
              <span className="flex-1">{category.name}</span>
              {needsAttention && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertCircle className="h-4 w-4 text-warning" />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>Configuration required</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
