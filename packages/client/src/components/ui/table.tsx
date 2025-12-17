import { type ComponentProps } from 'react';

import { cn } from '@/client/lib/utils';

function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className="relative w-full overflow-auto">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}

function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return <thead className={cn('[&_tr]:border-b', className)} {...props} />;
}

function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return <tbody className={cn('[&_tr:last-child]:border-b-0', className)} {...props} />;
}

function TableFooter({ className, ...props }: ComponentProps<'tfoot'>) {
  return (
    <tfoot
      className={cn(
        'border-t bg-card font-medium dark:bg-card/50 [&>tr]:last:border-b-0',
        className
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return <tr className={cn('border-b transition-colors hover:bg-card', className)} {...props} />;
}

function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-muted [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)} {...props} />
  );
}

function TableCaption({ className, ...props }: ComponentProps<'caption'>) {
  return <caption className={cn('mt-4 text-sm text-muted', className)} {...props} />;
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
