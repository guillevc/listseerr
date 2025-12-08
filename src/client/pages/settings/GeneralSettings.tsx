import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { trpc } from '../../lib/trpc';
import { useToast } from '../../hooks/use-toast';

export function GeneralSettings() {
  const [timezone, setTimezone] = useState('UTC');
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { data: settings } = trpc.generalSettings.get.useQuery();
  const saveMutation = trpc.generalSettings.set.useMutation({
    onSuccess: (data) => {
      // Invalidate queries to refresh UI immediately
      utils.generalSettings.get.invalidate();
      utils.scheduler.getScheduledJobs.invalidate();

      // Update local state immediately
      setTimezone(data.timezone);

      toast({
        title: 'Success',
        description: `Timezone updated to ${data.timezone}. Scheduler and logs will use this timezone.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (settings?.timezone) {
      setTimezone(settings.timezone);
    }
  }, [settings]);

  const handleSave = () => {
    if (!timezone.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Timezone is required',
        variant: 'destructive',
      });
      return;
    }
    saveMutation.mutate({ timezone: timezone.trim() });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">General Settings</h3>
        <p className="text-sm text-light-tx-2 dark:text-dark-tx-2 mt-1">
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
          <p className="text-xs text-light-tx-2 dark:text-dark-tx-2">
            <a
              href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              IANA timezone identifier
            </a>
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}
