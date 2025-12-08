import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/client/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-light-ui-2 dark:focus:ring-dark-ui-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-light-bl dark:bg-dark-bl text-white hover:bg-light-bl-2 hover:dark:bg-dark-bl-2',
        secondary:
          'border-transparent bg-light-bg-2 dark:bg-dark-bg-2 text-light-tx dark:text-dark-tx hover:bg-light-ui hover:dark:bg-dark-ui',
        destructive:
          'border-transparent bg-light-re dark:bg-dark-re text-white hover:bg-light-re-2 hover:dark:bg-dark-re-2',
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
