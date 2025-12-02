import { useState, useEffect } from 'react';
import { Cron } from 'croner';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

interface CronValidation {
  isValid: boolean;
  description: string;
  nextRuns?: string[];
}

function validateAndParseCron(cronExpression: string): CronValidation {
  if (!cronExpression.trim()) {
    return {
      isValid: false,
      description: 'Please enter a cron expression',
    };
  }

  try {
    const job = Cron(cronExpression, { paused: true });

    // Get next 3 run times
    const nextRuns: string[] = [];
    const now = new Date();
    let currentDate = new Date(now);

    for (let i = 0; i < 3; i++) {
      const nextRun = job.nextRun(currentDate);
      if (nextRun) {
        nextRuns.push(nextRun.toLocaleString());
        currentDate = new Date(nextRun.getTime() + 1000); // Add 1 second to get next occurrence
      }
    }

    // Generate human-readable description
    const description = generateCronDescription(cronExpression);

    return {
      isValid: true,
      description,
      nextRuns,
    };
  } catch (error) {
    return {
      isValid: false,
      description: error instanceof Error ? error.message : 'Invalid cron expression',
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
export function SyncScheduleSettings() {
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
    if (!validation.isValid) {
      return;
    }
    // TODO: Connect to backend API
    console.log('Saving sync schedule:', { cronExpression, isEnabled });
  };

  const handleDisable = () => {
    setIsEnabled(false);
    // TODO: Connect to backend API
    console.log('Disabling sync schedule');
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
        <h3 className="text-lg font-semibold">Sync Schedule</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure automatic synchronization schedule using cron expressions
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cron Expression</CardTitle>
          <CardDescription>
            Define when automatic list synchronization should occur. Learn more at{' '}
            <a
              href="https://crontab.guru"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              crontab.guru
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
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
              Format: minute hour day month day-of-week
            </p>
          </div>

          {/* Validation feedback */}
          {cronExpression && (
            <div
              className={`flex items-start gap-2 p-3 rounded-md ${
                validation.isValid
                  ? 'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100'
                  : 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100'
              }`}
            >
              {validation.isValid ? (
                <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{validation.description}</p>
                {validation.nextRuns && validation.nextRuns.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-semibold">Next 3 scheduled runs:</p>
                    {validation.nextRuns.map((run, index) => (
                      <p key={index} className="text-xs">
                        {index + 1}. {run}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Common patterns */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Common Patterns
            </Label>
            <div className="flex flex-wrap gap-2">
              {commonPatterns.map((pattern) => (
                <Badge
                  key={pattern.value}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => setCronExpression(pattern.value)}
                >
                  {pattern.label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={!validation.isValid}
            >
              Save Schedule
            </Button>
            {isEnabled && (
              <Button variant="outline" onClick={handleDisable}>
                Disable Schedule
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info card */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-2">Cron Expression Format</p>
              <div className="space-y-1 text-xs">
                <p>• <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">*</code> = any value</p>
                <p>• <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">*/n</code> = every n units</p>
                <p>• <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">a,b,c</code> = specific values</p>
                <p>• <code className="bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">a-b</code> = range of values</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
