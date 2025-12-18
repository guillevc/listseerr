import { Link } from '@tanstack/react-router';
import { RefreshCw, Settings, ListPlus, ChevronRight } from 'lucide-react';
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
        <Link to="/settings/jellyseerr">
          <Card variant="warning">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Get Started
                </span>
                <ChevronRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription>
                Connect your Jellyseerr instance to start automatically requesting media from your
                lists.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
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
