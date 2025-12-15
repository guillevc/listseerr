import { createContext, use, type ComponentProps } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { cn } from '@/client/lib/utils';

type CardVariant = 'default' | 'success' | 'destructive' | 'warning' | 'info';

type CardContextValue = { variant: CardVariant };

const CardContext = createContext<CardContextValue | null>(null);

function useCardContext(): CardContextValue {
  const context = use(CardContext);
  if (!context) {
    return { variant: 'default' };
  }
  return context;
}

const cardVariants = tv({
  base: 'rounded-lg border bg-card text-foreground shadow-sm',
  variants: {
    variant: {
      default: '',
      success: 'border-success bg-success/10',
      destructive: 'border-destructive bg-destructive/10',
      warning: 'border-warning-border bg-warning',
      info: 'border-info bg-info/10',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const cardTitleVariants = tv({
  base: 'text-lg font-semibold leading-none tracking-tight',
  variants: {
    variant: {
      default: '',
      success: 'text-success-hover',
      destructive: 'text-destructive-hover',
      warning: 'text-warning-foreground',
      info: 'text-info-hover',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const cardDescriptionVariants = tv({
  base: 'text-sm',
  variants: {
    variant: {
      default: 'text-muted',
      success: 'text-success',
      destructive: 'text-destructive',
      warning: 'text-warning-muted',
      info: 'text-info',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface CardProps extends ComponentProps<'div'>, VariantProps<typeof cardVariants> {}

function Card({ className, variant = 'default', ...props }: CardProps) {
  return (
    <CardContext value={{ variant: variant ?? 'default' }}>
      <div className={cn(cardVariants({ variant }), className)} {...props} />
    </CardContext>
  );
}

function CardHeader({ className, ...props }: ComponentProps<'header'>) {
  return <header className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />;
}

function CardTitle({ className, ...props }: ComponentProps<'h3'>) {
  const { variant } = useCardContext();
  return <h3 className={cn(cardTitleVariants({ variant }), className)} {...props} />;
}

function CardDescription({ className, ...props }: ComponentProps<'p'>) {
  const { variant } = useCardContext();
  return <p className={cn(cardDescriptionVariants({ variant }), className)} {...props} />;
}

function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}

function CardFooter({ className, ...props }: ComponentProps<'footer'>) {
  return <footer className={cn('flex items-center p-6 pt-0', className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cardVariants };
export type { CardProps, CardVariant };
