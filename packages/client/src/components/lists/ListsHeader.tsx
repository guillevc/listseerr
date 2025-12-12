import { RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { AddListDialog } from './AddListDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface ListsHeaderProps {
  onProcessAll: () => void;
  processingLists: Set<number>;
  hasLists: boolean;
  jellyseerrConfigured: boolean;
}

export function ListsHeader({
  onProcessAll,
  processingLists,
  hasLists,
  jellyseerrConfigured,
}: ListsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-3xl font-bold">Lists</h1>
      <div className="flex gap-2">
        <AddListDialog />
        {hasLists && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={onProcessAll}
                  disabled={!jellyseerrConfigured || processingLists.size > 0}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${processingLists.size > 0 ? 'animate-spin' : ''}`}
                  />
                  Process All
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Check all lists for new items and request them to Jellyseerr</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
