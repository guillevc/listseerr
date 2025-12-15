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
      outline: 'border-2 border-border bg-transparent text-foreground',
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
      accent: 'purple',
      class: [
        'text-light-pu border-light-pu-2',
        'hover:border-light-pu-2 hover:ring hover:ring-light-pu-2',
        'dark:text-dark-pu dark:border-dark-pu-2',
        'dark:hover:border-dark-pu-2 dark:hover:ring-dark-pu-2',
      ],
    },
    {
      variant: 'outline',
      accent: 'cyan',
      class:
        'border-light-cy-2 text-light-cy-2 hover:border-light-cy dark:border-dark-cy-2 dark:text-dark-cy-2 dark:hover:border-dark-cy',
    },
    {
      variant: 'outline',
      accent: 'blue',
      class:
        'border-light-bl-2 text-light-bl-2 hover:border-light-bl dark:border-dark-bl-2 dark:text-dark-bl-2 dark:hover:border-dark-bl',
    },
    {
      variant: 'outline',
      accent: 'green',
      class:
        'border-light-gr-2 text-light-gr-2 hover:border-light-gr dark:border-dark-gr-2 dark:text-dark-gr-2 dark:hover:border-dark-gr',
    },
    {
      variant: 'outline',
      accent: 'orange',
      class:
        'border-light-or-2 text-light-or-2 hover:border-light-or dark:border-dark-or-2 dark:text-dark-or-2 dark:hover:border-dark-or',
    },
    {
      variant: 'outline',
      accent: 'red',
      class:
        'border-light-re-2 text-light-re-2 hover:border-light-re dark:border-dark-re-2 dark:text-dark-re-2 dark:hover:border-dark-re',
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
