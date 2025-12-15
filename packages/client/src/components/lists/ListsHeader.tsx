import { Button } from '../ui/button';
import { AddListDialog } from './AddListDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useMinLoading } from '../../hooks/use-min-loading';

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
  const isProcessing = useMinLoading(processingLists.size > 0);

  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
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
                  loading={isProcessing}
                  disabled={!jellyseerrConfigured}
                >
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
