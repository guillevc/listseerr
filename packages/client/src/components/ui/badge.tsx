import { type ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { cn } from '@/client/lib/utils';

const badgeVariants = tv({
  base: 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  variants: {
    variant: {
      default: 'border-transparent bg-primary text-white hover:bg-primary-hover',
      secondary: 'border-transparent bg-card text-foreground hover:bg-border',
      destructive: 'border-transparent bg-destructive text-white hover:bg-destructive-hover',
      outline: 'text-foreground',
      trakt: 'border-transparent bg-magenta-600 text-white',
      letterboxd: 'border-transparent bg-orange-600 text-white',
      mdblist: 'border-transparent bg-blue-600 text-white',
      imdb: 'border-transparent bg-yellow-600 text-white',
      tmdb: 'border-transparent bg-cyan-600 text-white',
      simple: 'border-transparent',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface BadgeProps extends ComponentProps<'div'>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
export type { BadgeProps };
