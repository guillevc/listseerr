import { type ComponentProps } from 'react';
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { cn } from '@/client/lib/utils';

interface ExternalLinkProps extends ComponentProps<'a'> {
  showIcon?: boolean;
}

function ExternalLink({ className, children, showIcon = true, ...props }: ExternalLinkProps) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'text-link hover:underline',
        showIcon && 'inline-flex items-center gap-1',
        className
      )}
      {...props}
    >
      {children}
      {showIcon && <ExternalLinkIcon className="h-3 w-3" />}
    </a>
  );
}

export { ExternalLink };
