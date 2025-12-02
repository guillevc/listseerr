import { useState } from 'react';
import { SettingsSidebar } from '../../components/layout/SettingsSidebar';
import { JellyseerrSettings } from './JellyseerrSettings';
import { ApiKeysSettings } from './ApiKeysSettings';
import { SyncScheduleSettings } from './SyncScheduleSettings';
import { Card } from '../../components/ui/card';

export function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState('jellyseerr');

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
            <SettingsSidebar
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* Content */}
          <div className="flex-1 p-6 md:p-8">
            {activeCategory === 'jellyseerr' && <JellyseerrSettings />}
            {activeCategory === 'api-keys' && <ApiKeysSettings />}
            {activeCategory === 'sync-schedule' && <SyncScheduleSettings />}
            {/* Future categories can be added here */}
          </div>
        </div>
      </Card>
    </div>
  );
}
