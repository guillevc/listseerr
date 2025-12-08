import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/client/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-light-bl text-white hover:bg-light-bl-2 dark:bg-dark-bl dark:hover:bg-dark-bl-2',
        destructive:
          'bg-light-re text-white hover:bg-light-re-2 dark:bg-dark-re dark:hover:bg-dark-re-2',
        outline:
          'border-2 border-light-ui-2 dark:border-dark-ui-2 bg-transparent text-light-tx dark:text-dark-tx hover:bg-light-bg-2 hover:dark:bg-dark-bg-2 hover:border-light-ui-3 hover:dark:border-dark-ui-3',
        secondary:
          'bg-light-bg-2 dark:bg-dark-bg-2 text-light-tx dark:text-dark-tx hover:bg-light-ui hover:dark:bg-dark-ui',
        ghost: 'hover:bg-light-bg-2 hover:dark:bg-dark-bg-2 hover:text-light-tx hover:dark:text-dark-tx',
        link: 'text-light-bl dark:text-dark-bl underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
