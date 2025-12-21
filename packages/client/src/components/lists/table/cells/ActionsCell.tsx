import { RefreshCw, Trash2, MoreHorizontal, Pencil } from 'lucide-react';
import { Button } from '../../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../ui/dropdown-menu';

interface ActionsCellProps {
  listId: number;
  isProcessing: boolean;
  isProviderConfigured: boolean;
  jellyseerrConfigured: boolean;
  isDeleting: boolean;
  onProcess: (id: number) => void;
  onEdit: () => void;
  onDelete: (id: number) => void;
}

export function ActionsCell({
  listId,
  isProcessing,
  isProviderConfigured,
  jellyseerrConfigured,
  isDeleting,
  onProcess,
  onEdit,
  onDelete,
}: ActionsCellProps) {
  return (
    <div className="flex items-center justify-end">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" avoidCollisions={true}>
          <DropdownMenuItem
            onClick={() => onProcess(listId)}
            disabled={isProcessing || !isProviderConfigured || !jellyseerrConfigured}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
            Process
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(listId)}
            disabled={isDeleting}
            className="text-light-re focus:text-light-re dark:text-dark-re focus:dark:text-dark-re"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
