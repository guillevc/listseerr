import { useState } from 'react';
import { SettingsSidebar } from '../../components/layout/SettingsSidebar';
import { JellyseerrSettings } from './JellyseerrSettings';

export function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState('jellyseerr');

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <SettingsSidebar
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <div className="flex-1">
        {activeCategory === 'jellyseerr' && <JellyseerrSettings />}
        {/* Future categories can be added here */}
      </div>
    </div>
  );
}
