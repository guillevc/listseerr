import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { ExternalLink } from '../../components/ui/external-link';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { trpc } from '../../lib/trpc';
import { useToast } from '../../hooks/use-toast';
import { useMinLoading } from '../../hooks/use-min-loading';

export function GeneralSettings() {
  const [timezone, setTimezone] = useState('UTC');
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const { data: settingsData } = trpc.generalSettings.get.useQuery();
  const settings = settingsData?.settings;

  const saveMutation = trpc.generalSettings.set.useMutation({
    onSuccess: (result) => {
      const data = result.settings;

      // Invalidate queries to refresh UI immediately
      void utils.generalSettings.get.invalidate();
      void utils.scheduler.getScheduledJobs.invalidate();

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
  const isSaving = useMinLoading(saveMutation.isPending);

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
        <h3 className="text-lg font-semibold">General</h3>
        <p className="mt-1 text-sm text-muted">Configure general application settings</p>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            placeholder="Europe/Madrid"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          />
          <p className="text-xs text-muted">
            <ExternalLink href="https://en.wikipedia.org/wiki/List_of_tz_database_time_zones">
              IANA timezone identifier
            </ExternalLink>
          </p>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} loading={isSaving}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
