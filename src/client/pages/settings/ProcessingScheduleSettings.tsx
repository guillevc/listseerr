import { useState, useEffect } from 'react';
import { Cron } from 'croner';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Card, CardContent } from '../../components/ui/card';

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
        errorMessage = 'Value out of range. Check minute (0-59), hour (0-23), day (1-31), month (1-12).';
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
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (month.includes(',')) {
      const months = month.split(',').map(m => monthNames[parseInt(m) - 1]).join(', ');
      description += ` in ${months}`;
    } else {
      description += ` in ${monthNames[parseInt(month) - 1]}`;
    }
  }

  // Handle day of week
  if (dayOfWeek !== '*') {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (dayOfWeek.includes(',')) {
      const days = dayOfWeek.split(',').map(d => dayNames[parseInt(d)]).join(', ');
      description += ` on ${days}`;
    } else {
      description += ` on ${dayNames[parseInt(dayOfWeek)]}`;
    }
  }

  return description;
}

// Placeholder component - will be connected to backend later
export function ProcessingScheduleSettings() {
  const [cronExpression, setCronExpression] = useState('');
  const [validation, setValidation] = useState<CronValidation>({
    isValid: false,
    description: '',
  });
  const [isEnabled, setIsEnabled] = useState(false);

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
      return;
    }
    // TODO: Connect to backend API
    console.log('Saving processing schedule:', { cronExpression, isEnabled });
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
        <p className="text-sm text-muted-foreground mt-1">
          Schedule automatic list processing: checks lists for new items and requests them to Jellyseerr
        </p>
      </div>

      <Separator />

      {/* Enable/Disable Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="schedule-enabled" className="text-base">
                Enable Automatic Processing
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically check lists for new items and request them to Jellyseerr on a schedule
              </p>
            </div>
            <Switch
              id="schedule-enabled"
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
            />
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
                  <Label className="text-sm mb-3 block">Quick Patterns</Label>
                  <div className="flex flex-wrap gap-2">
                    {commonPatterns.map((pattern) => (
                      <Badge
                        key={pattern.value}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent transition-colors"
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
                  <Label htmlFor="cron-expression">Cron Expression</Label>
                  <Input
                    id="cron-expression"
                    placeholder="0 4 * * *"
                    value={cronExpression}
                    onChange={(e) => setCronExpression(e.target.value)}
                    className={
                      cronExpression
                        ? validation.isValid
                          ? 'border-green-500 focus-visible:ring-green-500'
                          : 'border-red-500 focus-visible:ring-red-500'
                        : ''
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: minute hour day month day-of-week •{' '}
                    <a
                      href="https://crontab.guru"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      crontab.guru helper
                    </a>
                  </p>
                </div>

                {/* Validation feedback */}
                {cronExpression && (
                  <div
                    className={`flex items-start gap-3 p-3 rounded-md mt-3 ${
                      validation.isValid
                        ? 'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100'
                        : 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100'
                    }`}
                  >
                    {validation.isValid ? (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-[0.1rem]" />
                    ) : (
                      <AlertCircle className="h-5 w-5 flex-shrink-0 mt-[0.1rem]" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-5">{validation.description}</p>
                      {validation.nextRun && (
                        <p className="text-xs mt-1 opacity-90">
                          Next run: {validation.nextRun}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!validation.isValid}
            >
              Save Schedule
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
