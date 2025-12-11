import { Settings, Key, Clock, SlidersHorizontal } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

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
  // Future categories can be added here:
  // { id: 'application', name: 'Application', icon: <Cog className="h-4 w-4" />, path: '/settings/application' },
  // { id: 'account', name: 'Account', icon: <User className="h-4 w-4" />, path: '/settings/account' },
];

interface SettingsSidebarProps {
  activeCategory?: string;
}

export function SettingsSidebar({
  activeCategory = 'general',
}: SettingsSidebarProps) {
  return (
    <aside className="w-full md:w-64">
      <nav className="space-y-1 p-2">
        {settingsCategories.map((category) => {
          const isActive = category.id === activeCategory;

          return (
            <Link
              key={category.id}
              to={category.path}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors text-left rounded-md border border-transparent',
                isActive
                  ? 'bg-background/70 dark:bg-background/50 text-foreground border-input'
                  : 'text-muted hover:text-foreground hover:bg-card/50'
              )}
            >
              {category.icon}
              {category.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
