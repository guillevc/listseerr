import { RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { AddListDialog } from './AddListDialog';

interface ListsHeaderProps {
  onSyncAll: () => void;
  syncingLists: Set<number>;
  hasLists: boolean;
  jellyseerrConfigured: boolean;
}

export function ListsHeader({
  onSyncAll,
  syncingLists,
  hasLists,
  jellyseerrConfigured,
}: ListsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 className="text-3xl font-bold">Lists</h1>
      <div className="flex gap-2">
        <AddListDialog />
        {hasLists && (
          <Button
            variant="outline"
            onClick={onSyncAll}
            disabled={!jellyseerrConfigured || syncingLists.size > 0}
          >
            <RefreshCw
              className={`h-4 w-4 ${
                syncingLists.size > 0 ? 'animate-spin' : ''
              }`}
            />
            Sync All
          </Button>
        )}
      </div>
    </div>
  );
}
