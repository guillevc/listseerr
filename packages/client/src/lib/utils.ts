import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRelativeTime(date?: Date | string | null): string {
  if (!date) return 'Never';

  const now = new Date();
  const diffMs = new Date(date).getTime() - now.getTime();
  const isPast = diffMs < 0;
  const absDiffMs = Math.abs(diffMs);

  const diffSecs = Math.floor(absDiffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const prefix = isPast ? '' : 'in ';
  const suffix = isPast ? ' ago' : '';

  if (diffSecs < 10) return isPast ? 'just now' : 'in a few seconds';
  if (diffSecs < 60) return `${prefix}${diffSecs}s${suffix}`;
  if (diffMins < 60) return `${prefix}${diffMins}m${suffix}`;
  if (diffHours < 24) return `${prefix}${diffHours}h${suffix}`;
  if (diffDays < 7) return `${prefix}${diffDays}d${suffix}`;
  if (diffWeeks < 4) return `${prefix}${diffWeeks}w${suffix}`;
  if (diffMonths < 12) return `${prefix}${diffMonths}mo${suffix}`;
  return `${prefix}${diffYears}y${suffix}`;
}
