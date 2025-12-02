import { Settings, Key, Clock } from 'lucide-react';
import { cn } from '@/client/lib/utils';

interface SettingsCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const settingsCategories: SettingsCategory[] = [
  {
    id: 'jellyseerr',
    name: 'Jellyseerr',
    icon: <Settings className="h-4 w-4" />,
  },
  {
    id: 'api-keys',
    name: 'API Keys',
    icon: <Key className="h-4 w-4" />,
  },
  {
    id: 'sync-schedule',
    name: 'Sync Schedule',
    icon: <Clock className="h-4 w-4" />,
  },
  // Future categories can be added here:
  // { id: 'application', name: 'Application', icon: <Cog className="h-4 w-4" /> },
  // { id: 'account', name: 'Account', icon: <User className="h-4 w-4" /> },
];

interface SettingsSidebarProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export function SettingsSidebar({
  activeCategory = 'jellyseerr',
  onCategoryChange,
}: SettingsSidebarProps) {
  return (
    <aside className="w-full md:w-64">
      <nav className="space-y-1 p-2">
        {settingsCategories.map((category) => {
          const isActive = category.id === activeCategory;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange?.(category.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors text-left',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              {category.icon}
              {category.name}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
