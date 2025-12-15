import { type ComponentProps } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { tv, type VariantProps } from 'tailwind-variants';

import { cn } from '@/client/lib/utils';

const labelVariants = tv({
  base: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
});

interface LabelProps
  extends ComponentProps<typeof LabelPrimitive.Root>, VariantProps<typeof labelVariants> {}

function Label({ className, ref, ...props }: LabelProps) {
  return <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />;
}

export { Label };
