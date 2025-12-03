import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { RefreshCw, Trash2, ExternalLink, Clock, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { getProviderName } from '../../lib/url-validator';
import { getRelativeTime } from '../../lib/utils';
import { trpc } from '../../lib/trpc';
import { useToast } from '../../hooks/use-toast';

interface Props {
  lists: Array<{
    id: number;
    name: string;
    url: string;
    provider: 'trakt' | 'letterboxd' | 'mdblist' | 'imdb' | 'tmdb';
    enabled: boolean;
    maxItems?: number | null;
    lastProcessed?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    processingSchedule?: string | null;
  }>;
  onProcess: (id: number) => void;
  processingLists: Set<number>;
}

type MediaList = Props['lists'][0];

const columnHelper = createColumnHelper<MediaList>();

export function ListsTable({ lists, onProcess, processingLists }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const deleteMutation = trpc.lists.delete.useMutation({
    onSuccess: () => {
      // Invalidate all related queries
      utils.lists.getAll.invalidate();
      utils.dashboard.getStats.invalidate();
      utils.dashboard.getRecentActivity.invalidate();

      toast({
        title: 'List Removed',
        description: 'The list has been removed successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const toggleMutation = trpc.lists.toggleEnabled.useMutation({
    onSuccess: () => {
      // Invalidate all related queries
      utils.lists.getAll.invalidate();
      utils.dashboard.getStats.invalidate();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const formatDate = (date?: Date | null) => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleString();
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor('provider', {
        header: 'Provider',
        cell: (info) => (
          <Badge variant={info.getValue() as any}>
            {getProviderName(info.getValue())}
          </Badge>
        ),
      }),
      columnHelper.accessor('url', {
        header: 'URL',
        cell: (info) => (
          <a
            href={info.getValue()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
          >
            <span className="truncate max-w-[200px] md:max-w-xs">
              {info.getValue().substring(0, 50)}
              {info.getValue().length > 50 ? '...' : ''}
            </span>
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </a>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor('maxItems', {
        id: 'itemCount',
        header: 'Items',
        cell: (info) => {
          const maxItems = info.getValue();
          return (
            <div className="flex flex-col gap-0.5">
              {maxItems && (
                <span className="text-xs text-muted-foreground">Max: {maxItems}</span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('lastProcessed', {
        header: 'Processed',
        cell: (info) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-help text-sm">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{getRelativeTime(info.getValue())}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{formatDate(info.getValue())}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
        sortingFn: (rowA, rowB) => {
          const dateA = rowA.original.lastProcessed ? new Date(rowA.original.lastProcessed).getTime() : 0;
          const dateB = rowB.original.lastProcessed ? new Date(rowB.original.lastProcessed).getTime() : 0;
          return dateA - dateB;
        },
      }),
      columnHelper.accessor('enabled', {
        header: 'Enabled',
        cell: (info) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Switch
                    checked={info.getValue()}
                    onCheckedChange={() => toggleMutation.mutate({ id: info.row.original.id })}
                    disabled={toggleMutation.isPending}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Enable automatic processing for this list</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: (info) => {
          const list = info.row.original;
          const isProcessing = processingLists.has(list.id);
          return (
            <div className="flex items-center justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onProcess(list.id)}
                    disabled={!list.enabled || isProcessing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                    Process
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteMutation.mutate({ id: list.id })}
                    disabled={deleteMutation.isPending}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ],
    [onProcess, processingLists, deleteMutation, toggleMutation]
  );

  const table = useReactTable({
    data: lists,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : (
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'flex items-center gap-2 cursor-pointer select-none hover:text-foreground'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          <span className="text-muted-foreground">
                            {header.column.getIsSorted() === 'asc' ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ArrowDown className="h-4 w-4" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={!row.original.enabled ? 'opacity-60' : ''}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
