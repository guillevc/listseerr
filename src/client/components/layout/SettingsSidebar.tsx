import { Settings } from 'lucide-react';
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
    <aside className="w-full md:w-64 p-4 md:p-6 space-y-1">
      {settingsCategories.map((category) => {
        const isActive = category.id === activeCategory;

        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange?.(category.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            {category.icon}
            {category.name}
          </button>
        );
      })}
    </aside>
  );
}
