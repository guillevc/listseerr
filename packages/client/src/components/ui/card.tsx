import * as React from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

import { cn } from '@/client/lib/utils';

type CardVariant = 'default' | 'success' | 'destructive' | 'warning' | 'info';

const CardContext = React.createContext<{ variant: CardVariant }>({ variant: 'default' });

const useCardContext = () => React.useContext(CardContext);

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
  base: 'text-xl font-semibold leading-none tracking-tight',
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

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => (
    <CardContext.Provider value={{ variant: variant ?? 'default' }}>
      <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props}>
        {children}
      </div>
    </CardContext.Provider>
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { variant } = useCardContext();
    return <div ref={ref} className={cn(cardTitleVariants({ variant }), className)} {...props} />;
  }
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { variant } = useCardContext();
    return (
      <div ref={ref} className={cn(cardDescriptionVariants({ variant }), className)} {...props} />
    );
  }
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

// eslint-disable-next-line react-refresh/only-export-components
export { Card, cardVariants, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
