import { type ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { cn } from '@/client/lib/utils';

const inputVariants = tv({
  base: [
    'flex h-10 w-full rounded-md px-3 py-2 text-sm',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'bg-background placeholder:text-muted',
    'outline-none',
    'border',
    'focus-visible:ring-2',
  ],
  variants: {
    variant: {
      default: 'border-input focus-visible:ring-ring',
      success: 'border-input-success focus-visible:ring-ring-success',
      error: 'border-input-error focus-visible:ring-ring-error',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

type InputProps = ComponentProps<'input'> & VariantProps<typeof inputVariants>;

function Input({ className, type, variant, ...props }: InputProps) {
  return <input type={type} className={cn(inputVariants({ variant }), className)} {...props} />;
}

export { Input };
export type { InputProps };
