import { RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ListsHeader } from '../components/lists/ListsHeader';
import { ListStats } from '../components/lists/ListStats';
import { ListsTable } from '../components/lists/ListsTable';
import { trpc } from '../lib/trpc';
import { useListProcessor } from '../hooks/use-list-processor';

export function ListsPage() {
  const { data, isLoading: listsLoading } = trpc.lists.getAll.useQuery();
  const lists = data?.lists ?? [];
  const { processingLists, handleProcess, handleProcessAll, jellyseerrConfig, isLoadingConfig } =
    useListProcessor();

  if (listsLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted">Loading lists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Configuration Alert */}
      {!isLoadingConfig && !jellyseerrConfig && (
        <Card variant="warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Jellyseerr Configuration Required
            </CardTitle>
            <CardDescription>
              Please configure your Jellyseerr instance in Settings to start processing lists.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Header with Actions */}
      <ListsHeader
        onProcessAll={() => handleProcessAll(lists)}
        processingLists={processingLists}
        hasLists={lists.length > 0}
        jellyseerrConfigured={!!jellyseerrConfig}
      />

      {/* Stats */}
      {lists.length > 0 && <ListStats lists={lists} />}

      {/* Lists Table or Empty State */}
      {lists.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted">
              <p className="mb-2 text-lg">No lists added yet</p>
              <p className="text-sm">
                Add lists to automatically request new content to Jellyseerr
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="animate-fade-in-up">
          <ListsTable
            lists={lists}
            onProcess={(id) => handleProcess(id, lists)}
            processingLists={processingLists}
            jellyseerrConfigured={!!jellyseerrConfig}
          />
        </div>
      )}
    </div>
  );
}
