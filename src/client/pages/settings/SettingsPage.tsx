import { Outlet, useLocation } from '@tanstack/react-router';
import { SettingsSidebar } from '../../components/layout/SettingsSidebar';
import { Card } from '../../components/ui/card';

export function SettingsPage() {
  const location = useLocation();

  // Extract the active category from the pathname
  // e.g., /settings/general -> general
  const pathParts = location.pathname.split('/');
  const activeCategory = pathParts[pathParts.length - 1] || 'general';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your application configuration
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="border-b md:border-b-0 md:border-r bg-muted/30">
            <SettingsSidebar activeCategory={activeCategory} />
          </div>

          {/* Content */}
          <div className="flex-1 p-6 md:p-8">
            <Outlet />
          </div>
        </div>
      </Card>
    </div>
  );
}
