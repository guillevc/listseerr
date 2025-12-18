import { Link } from '@tanstack/react-router';
import { RefreshCw, AlertCircle, ListPlus } from 'lucide-react';
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
              Please configure your Jellyseerr instance in{' '}
              <Link to="/settings/jellyseerr" className="underline hover:text-foreground">
                Settings
              </Link>{' '}
              to start processing lists.
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
      {lists.length > 0 && <ListStats lists={lists} jellyseerrConfigured={!!jellyseerrConfig} />}

      {/* Lists Table or Empty State */}
      {lists.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <ListPlus className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-foreground">No lists added yet</h3>
              <p className="max-w-sm text-sm text-muted">
                Add lists from Trakt, MDBList, or StevenLu to automatically request new content to
                Jellyseerr
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
