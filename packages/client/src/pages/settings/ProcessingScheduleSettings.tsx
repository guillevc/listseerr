import { useState, useEffect } from 'react';
import { Cron } from 'croner';
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

interface CronValidation {
  isValid: boolean;
  description: string;
  nextRun?: string;
}

function validateAndParseCron(cronExpression: string): CronValidation {
  if (!cronExpression.trim()) {
    return {
      isValid: false,
      description: 'Please enter a cron expression',
    };
  }

  try {
    const job = new Cron(cronExpression, { paused: true });

    // Get next run time
    const nextRun = job.nextRun();
    const nextRunString = nextRun ? nextRun.toLocaleString() : undefined;

    // Generate human-readable description
    const description = generateCronDescription(cronExpression);

    return {
      isValid: true,
      description,
      nextRun: nextRunString,
    };
  } catch (error) {
    let errorMessage = 'Invalid cron expression';

    if (error instanceof Error) {
      // Clean up technical error messages
      if (error.message.includes('Syntax error')) {
        errorMessage = 'Invalid cron syntax. Please check your expression.';
      } else if (error.message.includes('illegal stepping')) {
        errorMessage = 'Invalid step value. Use format like */6 for every 6 units.';
      } else if (error.message.includes('out of range')) {
        errorMessage =
          'Value out of range. Check minute (0-59), hour (0-23), day (1-31), month (1-12).';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      isValid: false,
      description: errorMessage,
    };
  }
}

function generateCronDescription(cronExpression: string): string {
  const parts = cronExpression.trim().split(/\s+/);

  if (parts.length < 5) {
    return 'Invalid cron expression';
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Handle special expressions
  if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every minute';
  }

  let description = 'At ';

  // Handle minute
  if (minute === '*') {
    description = 'Every minute';
  } else if (minute.includes('/')) {
    const interval = minute.split('/')[1];
    description = `Every ${interval} minutes`;
  } else if (minute.includes(',')) {
    description += `minutes ${minute} `;
  } else {
    description += `minute ${minute} `;
  }

  // Handle hour
  if (hour !== '*' && !description.startsWith('Every')) {
    if (hour.includes('/')) {
      const interval = hour.split('/')[1];
      description = `Every ${interval} hours`;
    } else if (hour.includes(',')) {
      description += `of hours ${hour}`;
    } else {
      const hourNum = parseInt(hour);
      description = `At ${hourNum.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
    }
  }

  // Handle day of month
  if (dayOfMonth !== '*') {
    if (dayOfMonth.includes('/')) {
      const interval = dayOfMonth.split('/')[1];
      description += `, every ${interval} days`;
    } else if (dayOfMonth.includes(',')) {
      description += ` on days ${dayOfMonth}`;
    } else {
      description += ` on day ${dayOfMonth}`;
    }
  }

  // Handle month
  if (month !== '*') {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    if (month.includes(',')) {
      const months = month
        .split(',')
        .map((m) => monthNames[parseInt(m) - 1])
        .join(', ');
      description += ` in ${months}`;
    } else {
      description += ` in ${monthNames[parseInt(month) - 1]}`;
    }
  }

  // Handle day of week
  if (dayOfWeek !== '*') {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (dayOfWeek.includes(',')) {
      const days = dayOfWeek
        .split(',')
        .map((d) => dayNames[parseInt(d)])
        .join(', ');
      description += ` on ${days}`;
    } else {
      description += ` on ${dayNames[parseInt(dayOfWeek)]}`;
    }
  }

  return description;
}

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
      timezone: settings?.timezone || 'UTC',
      automaticProcessingEnabled: isEnabled,
      automaticProcessingSchedule: isEnabled ? cronExpression : undefined,
    });
  };

  const commonPatterns = [
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Every 6 hours', value: '0 */6 * * *' },
    { label: 'Every 12 hours', value: '0 */12 * * *' },
    { label: 'Daily at midnight', value: '0 0 * * *' },
    { label: 'Daily at 4:00 AM', value: '0 4 * * *' },
    { label: 'Weekly on Sunday', value: '0 0 * * 0' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Automatic Processing</h3>
        <p className="text-sm text-muted mt-1">
          Schedule automatic processing for all enabled lists. Lists are processed sequentially
          (oldest to newest) to avoid rate limits.
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
              <p className="text-sm text-muted">
                Process all enabled lists on the same schedule. Lists are processed sequentially
                from oldest to newest.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isEnabled && (
        <>
          {/* Schedule Configuration Card */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <h4 className="text-base font-semibold mb-4">Schedule Configuration</h4>

                {/* Common patterns */}
                <div className="mb-4">
                  <Label className="text-sm mb-2 block">Quick Patterns</Label>
                  <div className="flex flex-wrap gap-2">
                    {commonPatterns.map((pattern) => (
                      <Badge
                        key={pattern.value}
                        variant="outline"
                        className="cursor-pointer hover:bg-card-hover transition-colors"
                        onClick={() => setCronExpression(pattern.value)}
                      >
                        {pattern.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Cron Expression Input */}
                <div className="space-y-2 mt-4">
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
                          <CheckCircle2 className="h-5 w-5 shrink-0 mt-[0.1rem]" />
                        ) : (
                          <AlertCircle className="h-5 w-5 shrink-0 mt-[0.1rem]" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium leading-5">{validation.description}</p>
                          {validation.nextRun && (
                            <p className="text-xs mt-1 opacity-80">
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
        <Button
          onClick={handleSave}
          disabled={(isEnabled && !validation.isValid) || saveMutation.isPending}
        >
          {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
