import { useState, useEffect } from 'react';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { trpc } from '../../lib/trpc';

export function GeneralSettings() {
  const [currentTime, setCurrentTime] = useState('');

  const { data: timezoneData } = trpc.generalSettings.getTimezone.useQuery(undefined, {
    refetchInterval: 60000, // Refresh every minute
  });

  const timezone = timezoneData?.timezone ?? 'UTC';

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        setCurrentTime(
          now.toLocaleTimeString(undefined, {
            timeZone: timezone,
            timeStyle: 'medium',
          })
        );
      } catch {
        // If timezone is invalid, fall back to UTC
        setCurrentTime(new Date().toISOString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">General</h3>
        <p className="mt-1 text-sm text-muted">General application settings</p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input id="timezone" value={timezone} disabled className="font-mono" />
          <p className="text-sm text-muted">
            <code>{currentTime}</code> · Set via{' '}
            <code className="rounded bg-background px-1 py-0.5 font-mono text-xs text-foreground">
              TZ
            </code>{' '}
            environment variable
          </p>
        </div>
      </div>
    </div>
  );
}
