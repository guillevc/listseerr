import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/client/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-light-tx dark:text-dark-tx',
        trakt: 'border-transparent bg-magenta-600 text-white',
        letterboxd: 'border-transparent bg-orange-600 text-white',
        mdblist: 'border-transparent bg-blue-600 text-white',
        imdb: 'border-transparent bg-yellow-600 text-white',
        tmdb: 'border-transparent bg-cyan-600 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };
