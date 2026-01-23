import { memo } from 'react';
import { ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../ui/tooltip';
import { truncateTail } from '../formatters';

interface UrlCellProps {
  url: string;
  displayUrl?: string | null;
}

export const UrlCell = memo(function UrlCell({ url, displayUrl }: UrlCellProps) {
  const urlToShow = displayUrl || url;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={urlToShow}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-[150px] items-center gap-1 text-sm text-muted transition-colors hover:text-foreground sm:max-w-[180px]"
          >
            <span className="truncate">{truncateTail(urlToShow, 30)}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-md break-all">{urlToShow}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
