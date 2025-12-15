import { type ComponentProps, type ReactElement } from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { tv, type VariantProps } from 'tailwind-variants';
import { X } from 'lucide-react';

import { cn } from '@/client/lib/utils';

const ToastProvider = ToastPrimitives.Provider;

function ToastViewport({
  className,
  ref,
  ...props
}: ComponentProps<typeof ToastPrimitives.Viewport>) {
  return (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        'fixed top-0 z-100 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-md',
        className
      )}
      {...props}
    />
  );
}

const toastVariants = tv({
  base: 'border group pointer-events-auto relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-md p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full',
  variants: {
    variant: {
      default: 'bg-background text-foreground',
      destructive:
        'border-destructive-border bg-destructive-background text-destructive-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

interface ToastProps
  extends ComponentProps<typeof ToastPrimitives.Root>, VariantProps<typeof toastVariants> {}

function Toast({ className, variant, ref, ...props }: ToastProps) {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
}

function ToastAction({ className, ref, ...props }: ComponentProps<typeof ToastPrimitives.Action>) {
  return (
    <ToastPrimitives.Action
      ref={ref}
      className={cn(
        'inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors group-[.destructive]:border-border hover:bg-card group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive-background group-[.destructive]:hover:text-destructive-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none group-[.destructive]:focus:ring-destructive disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

function ToastClose({ className, ref, ...props }: ComponentProps<typeof ToastPrimitives.Close>) {
  return (
    <ToastPrimitives.Close
      ref={ref}
      className={cn(
        'absolute top-2 right-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-red-300 hover:text-foreground group-[.destructive]:hover:text-red-50 focus:opacity-100 focus:ring-2 focus:outline-none group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
        className
      )}
      toast-close=""
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  );
}

function ToastTitle({ className, ref, ...props }: ComponentProps<typeof ToastPrimitives.Title>) {
  return (
    <ToastPrimitives.Title
      ref={ref}
      className={cn('text-sm font-semibold', className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ref,
  ...props
}: ComponentProps<typeof ToastPrimitives.Description>) {
  return (
    <ToastPrimitives.Description
      ref={ref}
      className={cn('text-sm opacity-90', className)}
      {...props}
    />
  );
}

type ToastActionElement = ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
