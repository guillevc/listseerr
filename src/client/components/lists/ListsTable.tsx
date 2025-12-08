import { useMemo, useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { RefreshCw, Trash2, ExternalLink, Clock, ArrowUpDown, ArrowUp, ArrowDown, MoreHorizontal, Pencil, AlertCircle } from 'lucide-react';
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
import { getProviderName, getProviderColor } from '../../lib/url-validator';
import { getRelativeTime } from '../../lib/utils';
import { trpc } from '../../lib/trpc';
import { useToast } from '../../hooks/use-toast';
import { EditListDialog } from './EditListDialog';

import type { SerializedMediaList } from '@/shared/types';

type MediaList = SerializedMediaList;

interface Props {
  lists: MediaList[];
  onProcess: (id: number) => void;
  processingLists: Set<number>;
  jellyseerrConfigured?: boolean;
}

const columnHelper = createColumnHelper<MediaList>();

// Utility function to truncate text from the tail (show leading characters)
const truncateTail = (text: string, maxLength: number = 30): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export function ListsTable({ lists, onProcess, processingLists, jellyseerrConfigured = true }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingList, setEditingList] = useState<MediaList | null>(null);
  const [mutatingListId, setMutatingListId] = useState<number | null>(null);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // Check if automatic processing is enabled globally
  const { data: settings } = trpc.generalSettings.get.useQuery();
  const isAutomaticProcessingEnabled = settings?.automaticProcessingEnabled ?? false;

  // Check provider configurations
  const { data: traktConfig } = trpc.providerConfig.getTraktConfig.useQuery();
  const { data: mdbListConfig } = trpc.providerConfig.getMdbListConfig.useQuery();

  const isProviderConfigured = useCallback((provider: string) => {
    if (provider === 'trakt') return !!traktConfig?.clientId;
    if (provider === 'traktChart') return !!traktConfig?.clientId;
    if (provider === 'mdblist') return !!mdbListConfig?.apiKey;
    if (provider === 'stevenlu') return true; // StevenLu doesn't require configuration
    return false; // Other providers not yet implemented
  }, [traktConfig, mdbListConfig]);

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
    onMutate: ({ id }) => {
      setMutatingListId(id);
    },
    onSuccess: () => {
      // Invalidate all related queries
      utils.lists.getAll.invalidate();
      utils.dashboard.getStats.invalidate();
      setMutatingListId(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setMutatingListId(null);
    },
  });

  const formatDate = (date?: Date | string | null) => {
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
        cell: (info) => {
          const list = info.row.original;
          const providerConfigured = isProviderConfigured(list.provider);

          return (
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Badge variant="outline" className={`whitespace-nowrap border-0 ${getProviderColor(info.getValue())}`}>
                {getProviderName(info.getValue())}
              </Badge>
              {!providerConfigured && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {info.getValue() === 'trakt' ? 'Trakt' : info.getValue() === 'traktChart' ? 'Trakt Chart' : info.getValue() === 'mdblist' ? 'MDBList' : info.getValue()} provider is not configured.
                        Configure API key in Settings → API Keys to enable processing.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('url', {
        header: 'URL',
        cell: (info) => {
          const list = info.row.original;
          // Use displayUrl if available, otherwise fall back to url
          const displayUrl = list.displayUrl || info.getValue();
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={displayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-light-tx-2 dark:text-dark-tx-2 hover:text-light-tx hover:dark:text-dark-tx transition-colors inline-flex items-center gap-1 max-w-[150px] sm:max-w-[180px]"
                  >
                    <span className="truncate">
                      {truncateTail(displayUrl, 30)}
                    </span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-md break-all">{displayUrl}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
        enableSorting: false,
      }),
      columnHelper.accessor('maxItems', {
        id: 'maxItems',
        header: 'Max',
        cell: (info) => {
          const maxItems = info.getValue();
          return (
            <span className="text-sm">
              {maxItems ?? '—'}
            </span>
          );
        },
        enableSorting: false
      }),
      columnHelper.accessor('lastProcessed', {
        header: 'Processed',
        cell: (info) => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-help text-sm whitespace-nowrap">
                  <Clock className="h-3.5 w-3.5 flex-shrink-0" />
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
        size: 150,
        minSize: 150,
      }),
      columnHelper.accessor('enabled', {
        header: 'Scheduled',
        cell: (info) => {
          const list = info.row.original;
          const providerConfigured = isProviderConfigured(list.provider);
          const isMutating = mutatingListId === list.id;
          const isDisabled = !isAutomaticProcessingEnabled || isMutating || !providerConfigured;
          // Show as OFF when automatic processing is disabled or provider not configured
          const checkedState = isAutomaticProcessingEnabled && providerConfigured ? info.getValue() : false;

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Switch
                      checked={checkedState}
                      onCheckedChange={() => toggleMutation.mutate({ id: list.id })}
                      disabled={isDisabled}
                      className="transition-all duration-200"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {!providerConfigured ? (
                    <p>
                      {list.provider === 'trakt' ? 'Trakt' : list.provider === 'traktChart' ? 'Trakt Chart' : 'MDBList'} provider is not configured.{' '}
                      Configure API key in{' '}
                      <span className="font-medium">Settings → API Keys</span> to enable processing.
                    </p>
                  ) : !isAutomaticProcessingEnabled ? (
                    <p>
                      Automatic processing is disabled. Enable it in{' '}
                      <span className="font-medium">Settings → Automatic Processing</span> to enable scheduled processing.
                    </p>
                  ) : (
                    <p>Toggle scheduled automatic processing for this list</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: (info) => {
          const list = info.row.original;
          const isProcessing = processingLists.has(list.id);
          const providerConfigured = isProviderConfigured(list.provider);
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
                    onClick={() => onProcess(list.id)}
                    disabled={isProcessing || !providerConfigured || !jellyseerrConfigured}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
                    Process
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setEditingList(list)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
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
    [onProcess, processingLists, deleteMutation, toggleMutation, isAutomaticProcessingEnabled, isProviderConfigured, mutatingListId]
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
    <>
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
                              ? 'flex items-center gap-2 cursor-pointer select-none hover:text-light-tx hover:dark:text-dark-tx'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-light-tx-2 dark:text-dark-tx-2">
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
                  key={`list-${row.original.id}`}
                  className={
                    !isProviderConfigured(row.original.provider)
                      ? 'opacity-60 border-l-4 border-l-orange-500'
                      : ''
                  }
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

      {editingList && (
        <EditListDialog
          list={editingList}
          open={!!editingList}
          onOpenChange={(open) => !open && setEditingList(null)}
        />
      )}
    </>
  );
}
