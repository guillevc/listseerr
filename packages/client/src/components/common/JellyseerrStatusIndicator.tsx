import type { ReactNode } from 'react';
import { cn } from '@/client/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

type JellyseerrStatus = 'connected' | 'error' | 'not-configured' | 'loading';

interface JellyseerrStatusIndicatorProps {
  status: JellyseerrStatus;
  url?: string;
  pendingRequests?: number | null;
  compact?: boolean;
  children?: ReactNode;
}

const statusConfig = {
  connected: {
    color: 'bg-green-500',
    pulse: true,
    label: 'Connected',
    getDescription: (url?: string) =>
      url ? `${new URL(url).hostname}` : 'Connected to Jellyseerr',
  },
  error: {
    color: 'bg-red-500',
    pulse: false,
    label: 'Error',
    getDescription: () => 'Unable to connect to Jellyseerr',
  },
  'not-configured': {
    color: 'bg-orange-400',
    pulse: false,
    label: 'Not Configured',
    getDescription: () => 'Jellyseerr is not configured',
  },
  loading: {
    color: 'bg-gray-400',
    pulse: true,
    label: 'Checking',
    getDescription: () => 'Checking Jellyseerr connection...',
  },
};

export function StatusDot({ status, className }: { status: JellyseerrStatus; className?: string }) {
  const config = statusConfig[status];

  return (
    <span className={cn('relative flex h-3 w-3 items-center justify-center', className)}>
      {config.pulse && (
        <span
          className={cn(
            'absolute inline-flex h-2 w-2 animate-ping rounded-full opacity-75',
            config.color
          )}
        />
      )}
      <span className={cn('relative inline-flex h-2 w-2 rounded-full', config.color)} />
    </span>
  );
}

export function JellyseerrStatusIndicator({
  status,
  url,
  pendingRequests,
  compact = false,
  children,
}: JellyseerrStatusIndicatorProps) {
  const config = statusConfig[status];

  // Compact mode: wraps content with tooltip (children wrap the status dot + additional content)
  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {children ?? (
              <span className="cursor-help" aria-label={`Jellyseerr status: ${config.label}`}>
                <StatusDot status={status} />
              </span>
            )}
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="text-center">
              <p className="font-medium">{config.label}</p>
              <p className="text-xs text-muted">{config.getDescription(url)}</p>
              {pendingRequests != null && pendingRequests > 0 && (
                <p className="text-xs text-muted">{pendingRequests} pending requests</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Full mode: standalone button-style indicator
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="relative flex h-4 w-4 items-center justify-center"
            aria-label={`Jellyseerr status: ${config.label}`}
          >
            <StatusDot status={status} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="text-center">
            <p className="text-xs text-muted">Jellyseerr</p>
            <p className="font-medium">{config.label}</p>
            <p className="text-xs text-muted">{config.getDescription(url)}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
