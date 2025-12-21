import { Cron } from 'croner';

export interface CronValidation {
  isValid: boolean;
  description: string;
  nextRun?: string;
}

/**
 * Validate a cron expression and return parsed information.
 */
export function validateAndParseCron(cronExpression: string): CronValidation {
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

/**
 * Generate a human-readable description of a cron expression.
 */
export function generateCronDescription(cronExpression: string): string {
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

/**
 * Common cron patterns for quick selection.
 */
export const COMMON_CRON_PATTERNS = [
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Every 12 hours', value: '0 */12 * * *' },
  { label: 'Daily at midnight', value: '0 0 * * *' },
  { label: 'Daily at 4:00 AM', value: '0 4 * * *' },
  { label: 'Weekly on Sunday', value: '0 0 * * 0' },
] as const;
