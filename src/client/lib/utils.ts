import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
  if (diffSecs < 60) return `${prefix}${diffSecs} seconds${suffix}`;
  if (diffMins === 1) return `${prefix}1 minute${suffix}`;
  if (diffMins < 60) return `${prefix}${diffMins} minutes${suffix}`;
  if (diffHours === 1) return `${prefix}1 hour${suffix}`;
  if (diffHours < 24) return `${prefix}${diffHours} hours${suffix}`;
  if (diffDays === 1) return `${prefix}1 day${suffix}`;
  if (diffDays < 7) return `${prefix}${diffDays} days${suffix}`;
  if (diffWeeks === 1) return `${prefix}1 week${suffix}`;
  if (diffWeeks < 4) return `${prefix}${diffWeeks} weeks${suffix}`;
  if (diffMonths === 1) return `${prefix}1 month${suffix}`;
  if (diffMonths < 12) return `${prefix}${diffMonths} months${suffix}`;
  if (diffYears === 1) return `${prefix}1 year${suffix}`;
  return `${prefix}${diffYears} years${suffix}`;
}
