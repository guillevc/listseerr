import { type ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { cn } from '@/client/lib/utils';

const badgeVariants = tv({
  base: 'inline-flex whitespace-nowrap items-center rounded-full font-semibold',
  variants: {
    variant: {
      // legacy
      default: 'bg-primary text-foreground hover:bg-primary-hover',
      secondary: 'bg-card text-foreground',
      simple: '',
      // new
      outline: 'cursor-pointer transition-colors hover:bg-card-hover border-2 border-border',
      success: 'text-success-foreground border-success-border bg-success',
      destructive: 'text-destructive-foreground border-destructive-border bg-destructive',
      warning: 'text-warning-foreground border-warning-border bg-warning',
      info: 'text-info-foreground border-info-border bg-info',
      trakt: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-100',
      traktChart: 'bg-magenta-100 text-magenta-600 dark:bg-magenta-900 dark:text-magenta-100',
      mdblist: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-100',
      stevenlu: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-100',
      scheduled: 'bg-primary/50 border border-border text-primary-foreground',
      manual: 'bg-background border border-border text-foreground',
    },
    size: {
      default: 'px-2.5 py-0.5 text-xs',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

interface BadgeProps extends ComponentProps<'div'>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
export type { BadgeProps };
