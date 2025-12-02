import { Settings, Key, Clock } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/client/lib/utils';

interface SettingsCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  path: string;
}

const settingsCategories: SettingsCategory[] = [
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
    id: 'sync-schedule',
    name: 'Sync Schedule',
    icon: <Clock className="h-4 w-4" />,
    path: '/settings/sync-schedule',
  },
  // Future categories can be added here:
  // { id: 'application', name: 'Application', icon: <Cog className="h-4 w-4" />, path: '/settings/application' },
  // { id: 'account', name: 'Account', icon: <User className="h-4 w-4" />, path: '/settings/account' },
];

interface SettingsSidebarProps {
  activeCategory?: string;
}

export function SettingsSidebar({
  activeCategory = 'jellyseerr',
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
                'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors text-left rounded-md',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
