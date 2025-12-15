import { type ComponentProps } from 'react';

import { cn } from '@/client/lib/utils';

type InputProps = ComponentProps<'input'>;

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md px-3 py-2 text-sm',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'bg-background placeholder:text-muted',
        'border border-input hover:border-border-hover',
        'outline-none',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring/40',
        className
      )}
      {...props}
    />
  );
}

export { Input };
export type { InputProps };
