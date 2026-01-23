import { memo } from 'react';
import { Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../../ui/tooltip';
import { getRelativeTime } from '../../../../lib/utils';
import { formatDate } from '../formatters';

interface LastProcessedCellProps {
  lastProcessed?: Date | string | null;
}

export const LastProcessedCell = memo(function LastProcessedCell({
  lastProcessed,
}: LastProcessedCellProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex cursor-help items-center gap-1.5 text-sm whitespace-nowrap">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{getRelativeTime(lastProcessed)}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{formatDate(lastProcessed)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
