import { type ComponentProps } from 'react';

import { cn } from '@/client/lib/utils';

function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('animate-pulse rounded-md bg-card', className)} {...props} />;
}

export { Skeleton };
