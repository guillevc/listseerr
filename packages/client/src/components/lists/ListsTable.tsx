import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { trpc } from '../../lib/trpc';
import { useToast } from '../../hooks/use-toast';
import { useProviderConfig } from '../../hooks/use-provider-config';
import { invalidateListQueries } from '../../lib/cache-utils';
import { showListOperationToast, showErrorToast } from '../../lib/toast-helpers';
import { EditListDialog } from './EditListDialog';
import {
  ProviderCell,
  UrlCell,
  LastProcessedCell,
  AutoProcessCell,
  ActionsCell,
} from './table';

import type { SerializedMediaList } from 'shared/application/dtos/core/media-list.dto';
import type { ProviderType } from 'shared/domain/types/provider.types';

// Transform DTO type for table use - provider is validated by server
type MediaList = Omit<SerializedMediaList, 'provider'> & {
  provider: ProviderType;
};

interface Props {
  lists: MediaList[];
  onProcess: (id: number) => void;
  processingLists: Set<number>;
  jellyseerrConfigured?: boolean;
}

const columnHelper = createColumnHelper<MediaList>();

export function ListsTable({
  lists,
  onProcess,
  processingLists,
  jellyseerrConfigured = true,
}: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingList, setEditingList] = useState<MediaList | null>(null);
  const [mutatingListId, setMutatingListId] = useState<number | null>(null);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // Check if automatic processing is enabled globally
  const { data: settingsData } = trpc.generalSettings.get.useQuery();
  const settings = settingsData?.settings;
  const isAutomaticProcessingEnabled = settings?.automaticProcessingEnabled ?? false;

  // Check provider configurations
  const { isProviderConfigured } = useProviderConfig();

  const deleteMutation = trpc.lists.delete.useMutation({
    onSuccess: () => {
      invalidateListQueries(utils);
      showListOperationToast(toast, 'delete');
    },
    onError: (error) => {
      showErrorToast(toast, error);
    },
  });

  const toggleMutation = trpc.lists.toggleEnabled.useMutation({
    onMutate: ({ id }) => {
      setMutatingListId(id);
    },
    onSuccess: () => {
      void utils.lists.getAll.invalidate();
      void utils.dashboard.getStats.invalidate();
      setMutatingListId(null);
    },
    onError: (error) => {
      showErrorToast(toast, error);
      setMutatingListId(null);
    },
  });

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
          return (
            <ProviderCell
              provider={list.provider}
              isProviderConfigured={isProviderConfigured(list.provider)}
            />
          );
        },
      }),
      columnHelper.accessor('url', {
        header: 'URL',
        cell: (info) => {
          const list = info.row.original;
          return <UrlCell url={info.getValue()} displayUrl={list.displayUrl} />;
        },
        enableSorting: false,
      }),
      columnHelper.accessor('maxItems', {
        id: 'maxItems',
        header: 'Max',
        cell: (info) => {
          const maxItems = info.getValue();
          return <span className="text-sm">{maxItems ?? '—'}</span>;
        },
        enableSorting: false,
      }),
      columnHelper.accessor('lastProcessed', {
        header: 'Last processed',
        cell: (info) => <LastProcessedCell lastProcessed={info.getValue()} />,
        sortingFn: (rowA, rowB) => {
          const dateA = rowA.original.lastProcessed
            ? new Date(rowA.original.lastProcessed).getTime()
            : 0;
          const dateB = rowB.original.lastProcessed
            ? new Date(rowB.original.lastProcessed).getTime()
            : 0;
          return dateA - dateB;
        },
        size: 150,
        minSize: 150,
      }),
      columnHelper.accessor('enabled', {
        header: 'Auto-process',
        cell: (info) => {
          const list = info.row.original;
          return (
            <AutoProcessCell
              listId={list.id}
              provider={list.provider}
              enabled={info.getValue()}
              isProviderConfigured={isProviderConfigured(list.provider)}
              isAutomaticProcessingEnabled={isAutomaticProcessingEnabled}
              isMutating={mutatingListId === list.id}
              onToggle={(id) => toggleMutation.mutate({ id })}
            />
          );
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: (info) => {
          const list = info.row.original;
          return (
            <ActionsCell
              listId={list.id}
              isProcessing={processingLists.has(list.id)}
              isProviderConfigured={isProviderConfigured(list.provider)}
              jellyseerrConfigured={jellyseerrConfigured}
              isDeleting={deleteMutation.isPending}
              onProcess={onProcess}
              onEdit={() => setEditingList(list)}
              onDelete={(id) => deleteMutation.mutate({ id })}
            />
          );
        },
      }),
    ],
    [
      onProcess,
      processingLists,
      deleteMutation,
      toggleMutation,
      isAutomaticProcessingEnabled,
      isProviderConfigured,
      mutatingListId,
      jellyseerrConfigured,
    ]
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
                              ? 'flex cursor-pointer items-center gap-2 select-none hover:text-foreground'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-muted">
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
                      ? 'border-l-4 border-l-light-re-2 dark:border-l-dark-re-2'
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
