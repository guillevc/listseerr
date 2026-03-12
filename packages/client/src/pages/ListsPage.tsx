import { Link } from '@tanstack/react-router';
import { Settings, ListPlus, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { ListsHeader } from '../components/lists/ListsHeader';
import { ListStats } from '../components/lists/ListStats';
import { ListsTable } from '../components/lists/ListsTable';
import { AddListDialog } from '../components/lists/AddListDialog';
import { trpc } from '../lib/trpc';
import { useListProcessor } from '../hooks/use-list-processor';

function ListsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
      <div className="rounded-md border">
        <div className="border-b p-4">
          <div className="flex gap-8">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="hidden h-4 w-20 md:block" />
            <Skeleton className="hidden h-4 w-32 md:block" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-8 border-b p-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="hidden h-5 w-16 rounded-full md:block" />
            <Skeleton className="hidden h-4 w-48 md:block" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListsPage() {
  const { data, isLoading: listsLoading } = trpc.lists.getAll.useQuery();
  const lists = data?.lists ?? [];
  const { processingLists, handleProcess, handleProcessAll, seerrConfig, isLoadingConfig } =
    useListProcessor();

  if (listsLoading) {
    return <ListsSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Configuration Alert */}
      {!isLoadingConfig && !seerrConfig && (
        <Link to="/settings/seerr">
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
                Connect your Seerr instance to start automatically requesting media from your lists.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      )}

      {/* Header with Actions */}
      <div className="animate-fade-in-up">
        <ListsHeader
          onProcessAll={() => handleProcessAll(lists)}
          processingLists={processingLists}
          hasLists={lists.length > 0}
          seerrConfigured={!!seerrConfig}
        />
      </div>

      {/* Stats */}
      {lists.length > 0 && <ListStats lists={lists} seerrConfigured={!!seerrConfig} />}

      {/* Lists Table or Empty State */}
      {lists.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <ListPlus className="h-10 w-10 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-foreground">No lists added yet</h3>
              <p className="mb-6 max-w-sm text-sm text-muted">
                Add lists from Trakt, MDBList, or StevenLu to start requesting content.
              </p>
              <AddListDialog />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="animate-fade-in-up">
          <ListsTable
            lists={lists}
            onProcess={(id) => handleProcess(id, lists)}
            processingLists={processingLists}
            seerrConfigured={!!seerrConfig}
            globalSeerrUserId={seerrConfig?.userIdSeerr ?? null}
          />
        </div>
      )}
    </div>
  );
}
