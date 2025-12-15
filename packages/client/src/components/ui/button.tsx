import { type ComponentProps } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { tv, type VariantProps } from 'tailwind-variants';

import { cn } from '@/client/lib/utils';

const buttonVariants = tv({
  base: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  variants: {
    variant: {
      default: 'bg-primary hover:bg-primary-hover text-white border-2 border-transparent',
      destructive: 'bg-destructive text-white hover:bg-destructive-hover',
      outline: 'border-2 border-border bg-transparent text-foreground hover:border-border-hover',
      secondary: 'bg-card text-foreground hover:bg-border',
      ghost: 'hover:bg-card hover:text-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    },
    size: {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    },
    active: {
      true: '',
    },
  },
  compoundVariants: [
    {
      variant: 'ghost',
      active: true,
      class: 'bg-card text-foreground',
    },
  ],
  defaultVariants: {
    variant: 'default',
    size: 'default',
    active: false,
  },
});

interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, active, asChild = false, ref, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, active, className }))}
      ref={ref}
      {...props}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
