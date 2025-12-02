import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';

// Placeholder component - will be connected to backend later
export function GeneralSettings() {
  const [timezone, setTimezone] = useState('UTC');

  const handleSave = () => {
    // TODO: Connect to backend API
    console.log('Saving general settings:', { timezone });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">General Settings</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure general application settings
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            placeholder="America/New_York"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            IANA timezone identifier (e.g., America/New_York, Europe/London, Asia/Tokyo, UTC). Used for scheduling cron jobs and displaying timestamps.{' '}
            <a
              href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              View all timezones
            </a>
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave}>Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
