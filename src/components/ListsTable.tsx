import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { RefreshCw, Trash2, ExternalLink, Clock, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { MediaList } from '../types';
import { getProviderName, getProviderColor } from '../lib/url-validator';
import { getRelativeTime } from '../lib/utils';
import { useState } from 'react';

interface Props {
  lists: MediaList[];
  onSync: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string) => void;
  syncingLists: Set<string>;
}

const columnHelper = createColumnHelper<MediaList>();

export function ListsTable({ lists, onSync, onDelete, onToggleEnabled, syncingLists }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const formatDate = (date?: Date) => {
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
          <span
            className={`text-xs px-2 py-1 rounded text-white inline-block ${getProviderColor(
              info.getValue()
            )}`}
          >
            {getProviderName(info.getValue())}
          </span>
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
      columnHelper.accessor('itemCount', {
        header: 'Items',
        cell: (info) => {
          const itemCount = info.getValue();
          const maxItems = info.row.original.maxItems;
          return (
            <div className="flex flex-col gap-0.5">
              {itemCount !== undefined && (
                <span className="text-sm">
                  {itemCount} item{itemCount !== 1 ? 's' : ''}
                </span>
              )}
              {maxItems && (
                <span className="text-xs text-muted-foreground">Max: {maxItems}</span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('lastSync', {
        header: 'Last Sync',
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
          const dateA = rowA.original.lastSync ? new Date(rowA.original.lastSync).getTime() : 0;
          const dateB = rowB.original.lastSync ? new Date(rowB.original.lastSync).getTime() : 0;
          return dateA - dateB;
        },
      }),
      columnHelper.accessor('enabled', {
        header: 'Enabled',
        cell: (info) => (
          <Switch
            checked={info.getValue()}
            onCheckedChange={() => onToggleEnabled(info.row.original.id)}
          />
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: (info) => {
          const list = info.row.original;
          const isSyncing = syncingLists.has(list.id);
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSync(list.id)}
                disabled={!list.enabled || isSyncing}
                className="w-9 h-9 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(list.id)}
                className="w-9 h-9 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      }),
    ],
    [onSync, onDelete, onToggleEnabled, syncingLists]
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
