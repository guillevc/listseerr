import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { ExternalLink } from '../../components/ui/external-link';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Switch } from '../../components/ui/switch';
import { trpc } from '../../lib/trpc';
import { useToast } from '../../hooks/use-toast';
import { useMinLoading } from '../../hooks/use-min-loading';
import { validateAndParseCron, COMMON_CRON_PATTERNS, type CronValidation } from '../../lib/cron-validator';

export function ProcessingScheduleSettings() {
  const [cronExpression, setCronExpression] = useState('');
  const [validation, setValidation] = useState<CronValidation>({
    isValid: false,
    description: '',
  });
  const [isEnabled, setIsEnabled] = useState(false);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // Fetch current settings
  const { data: settingsData } = trpc.generalSettings.get.useQuery();
  const settings = settingsData?.settings;

  // Mutation to enable all lists
  const enableAllListsMutation = trpc.lists.enableAll.useMutation();

  // Save mutation
  const saveMutation = trpc.generalSettings.set.useMutation({
    onSuccess: async (result) => {
      const data = result.settings;

      // If we're enabling automatic processing, enable all lists
      if (data.automaticProcessingEnabled && !settings?.automaticProcessingEnabled) {
        await enableAllListsMutation.mutateAsync();
      }

      void utils.generalSettings.get.invalidate();
      void utils.scheduler.getScheduledJobs.invalidate();
      void utils.lists.getAll.invalidate();

      setCronExpression(data.automaticProcessingSchedule || '');
      setIsEnabled(data.automaticProcessingEnabled);

      const wasJustEnabled =
        data.automaticProcessingEnabled && !settings?.automaticProcessingEnabled;

      toast({
        title: 'Success',
        description: wasJustEnabled
          ? `Automatic processing enabled with schedule: ${cronExpression}. All lists have been enabled.`
          : data.automaticProcessingEnabled
            ? `Automatic processing updated with schedule: ${cronExpression}`
            : 'Automatic processing disabled',
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

  // Load settings when they arrive - syncing with external API data
  useEffect(() => {
    if (settings) {
      setCronExpression(settings.automaticProcessingSchedule || '');
      setIsEnabled(settings.automaticProcessingEnabled);
    }
  }, [settings]);

  // Validate cron expression - computed derived state
  useEffect(() => {
    if (cronExpression) {
      const result = validateAndParseCron(cronExpression);
      setValidation(result);
    } else {
      setValidation({
        isValid: false,
        description: '',
      });
    }
  }, [cronExpression]);

  const handleSave = () => {
    if (isEnabled && !validation.isValid) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid cron expression',
        variant: 'destructive',
      });
      return;
    }

    saveMutation.mutate({
      automaticProcessingEnabled: isEnabled,
      automaticProcessingSchedule: isEnabled ? cronExpression : undefined,
    });
  };


  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Automatic Processing</h3>
        <p className="mt-1 text-sm text-muted">
          Schedule automatic processing for all enabled lists.
        </p>
      </div>

      <Separator />

      {/* Enable/Disable Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Switch
              id="schedule-enabled"
              className="mt-1"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
            <div className="space-y-0.5">
              <Label htmlFor="schedule-enabled" className="text-base">
                Enable Automatic Processing
              </Label>
              <p className="text-sm text-muted">Process all lists on schedule.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isEnabled && (
        <>
          {/* Schedule Configuration Card */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <h4 className="mb-4 text-base font-semibold">Schedule Configuration</h4>

                {/* Common patterns */}
                <div className="mb-4">
                  <Label className="mb-2 block text-sm">Quick Patterns</Label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_CRON_PATTERNS.map((pattern) => (
                      <Badge
                        key={pattern.value}
                        variant="outline"
                        onClick={() => setCronExpression(pattern.value)}
                      >
                        {pattern.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Cron Expression Input */}
                <div className="mt-4 space-y-2">
                  <div className="grid gap-2">
                    <Label htmlFor="cron-expression">Cron Expression</Label>
                    <Input
                      id="cron-expression"
                      placeholder="0 4 * * *"
                      value={cronExpression}
                      onChange={(e) => setCronExpression(e.target.value)}
                      variant={
                        cronExpression ? (validation.isValid ? 'success' : 'error') : 'default'
                      }
                    />
                  </div>
                  <p className="text-xs text-muted">
                    Format: minute hour day month day-of-week •{' '}
                    <ExternalLink href="https://crontab.guru" className="font-medium">
                      crontab.guru helper
                    </ExternalLink>
                  </p>
                </div>

                {/* Validation feedback */}
                {cronExpression && (
                  <Card variant={validation.isValid ? 'success' : 'destructive'} className="mt-3">
                    <CardContent className="py-3">
                      <div className="flex items-start gap-3">
                        {validation.isValid ? (
                          <CheckCircle2 className="mt-[0.1rem] h-5 w-5 shrink-0" />
                        ) : (
                          <AlertCircle className="mt-[0.1rem] h-5 w-5 shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm leading-5 font-medium">{validation.description}</p>
                          {validation.nextRun && (
                            <p className="mt-1 text-xs opacity-80">
                              Next run: {validation.nextRun}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Save Button - always visible */}
      <div className="flex gap-2">
        <Button onClick={handleSave} loading={isSaving} disabled={isEnabled && !validation.isValid}>
          Save Settings
        </Button>
      </div>
    </div>
  );
}
