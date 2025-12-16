import { type ComponentProps } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { tv, type VariantProps } from 'tailwind-variants';
import { Loader2 } from 'lucide-react';

import { cn } from '@/client/lib/utils';

const buttonVariants = tv({
  base: 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  variants: {
    variant: {
      default: 'bg-primary hover:bg-primary-hover text-primary-foreground',
      destructive: 'bg-destructive hover:bg-destructive-hover text-destructive-foreground',
      outline: 'border-2 bg-transparent hover:ring',
      ghost: 'hover:bg-card',
    },
    size: {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    },
    accent: {
      default: '',
      purple: '',
      cyan: '',
      blue: '',
      green: '',
      orange: '',
      red: '',
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
    {
      variant: 'outline',
      accent: 'default',
      class: 'text-foreground border-border hover:ring-muted hover:border-muted',
    },
    {
      variant: 'outline',
      accent: 'purple',
      class: [
        'text-light-pu border-light-pu-2',
        'hover:border-light-pu-2 hover:ring-light-pu-2',
        'dark:text-dark-pu dark:border-dark-pu-2',
        'dark:hover:border-dark-pu-2 dark:hover:ring-dark-pu-2',
      ],
    },
  ],
  defaultVariants: {
    variant: 'default',
    size: 'default',
    accent: 'default',
    active: false,
  },
});

interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

function Button({
  className,
  variant,
  size,
  accent,
  active,
  asChild = false,
  loading = false,
  disabled,
  children,
  ref,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const isDisabled = disabled || loading;

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, accent, active, className }))}
      ref={ref}
      disabled={isDisabled}
      {...props}
    >
      {loading && !asChild ? (
        <span className="relative">
          <span className="opacity-0">{children}</span>
          <Loader2 className="absolute inset-0 m-auto animate-spin" />
        </span>
      ) : (
        children
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
