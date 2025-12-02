import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { ThemeToggle } from './components/theme-toggle';
import { JellyseerrConfigDialog } from './components/JellyseerrConfigDialog';
import { AddListDialog } from './components/AddListDialog';
import { ListsTable } from './components/ListsTable';
import { Toaster } from './components/ui/toaster';
import { useToast } from './hooks/use-toast';
import { trpc } from './lib/trpc';

function App() {
  const [syncingLists, setSyncingLists] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  // Fetch lists and config from backend
  const { data: lists = [], isLoading: listsLoading } = trpc.lists.getAll.useQuery();
  const { data: jellyseerrConfig, isLoading: configLoading } = trpc.config.get.useQuery();

  // Mutations
  const syncMutation = trpc.sync.syncList.useMutation({
    onSuccess: (result, variables) => {
      setSyncingLists((prev) => {
        const next = new Set(prev);
        next.delete(variables.listId);
        return next;
      });

      if (result.success) {
        toast({
          title: 'Sync Complete',
          description: `Found ${result.itemCount} items, requested ${result.requestedCount} new items`,
        });
      } else {
        toast({
          title: 'Sync Failed',
          description: result.error || 'Unknown error occurred',
          variant: 'destructive',
        });
      }
    },
    onError: (error, variables) => {
      setSyncingLists((prev) => {
        const next = new Set(prev);
        next.delete(variables.listId);
        return next;
      });

      toast({
        title: 'Sync Failed',
        description: error.message || 'Unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  const handleSync = async (id: number) => {
    if (!jellyseerrConfig) {
      toast({
        title: 'Configuration Required',
        description: 'Please configure Jellyseerr before syncing',
        variant: 'destructive',
      });
      return;
    }

    const list = lists.find((l) => l.id === id);
    if (!list) return;

    if (!list.enabled) {
      toast({
        title: 'List Disabled',
        description: 'This list is currently disabled',
        variant: 'destructive',
      });
      return;
    }

    setSyncingLists((prev) => new Set(prev).add(id));
    syncMutation.mutate({ listId: id });
  };

  const handleSyncAll = async () => {
    if (!jellyseerrConfig) {
      toast({
        title: 'Configuration Required',
        description: 'Please configure Jellyseerr before syncing',
        variant: 'destructive',
      });
      return;
    }

    const enabledLists = lists.filter((list) => list.enabled);
    if (enabledLists.length === 0) {
      toast({
        title: 'No Lists',
        description: 'No enabled lists to sync',
      });
      return;
    }

    toast({
      title: 'Syncing All Lists',
      description: `Starting sync for ${enabledLists.length} list(s)`,
    });

    for (const list of enabledLists) {
      await handleSync(list.id);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  if (listsLoading || configLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-4xl font-bold">Listseerr</h1>
              <p className="text-muted-foreground mt-1">
                Sync your lists to Jellyseerr
              </p>
            </motion.div>
            <div className="flex flex-wrap gap-2">
              <JellyseerrConfigDialog />
              <ThemeToggle />
            </div>
          </div>

          {!jellyseerrConfig && (
            <Card className="border-flexoki-orange bg-orange-50 dark:bg-orange-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-flexoki-orange">
                  <AlertCircle className="h-5 w-5" />
                  Configuration Required
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Please configure your Jellyseerr instance to start syncing lists.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2">
              <AddListDialog />
              {lists.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleSyncAll}
                  disabled={!jellyseerrConfig || syncingLists.size > 0}
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

          {lists.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg mb-2">No lists added yet</p>
                  <p className="text-sm">
                    Click "Add List" to get started with syncing your lists
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ListsTable
                lists={lists}
                onSync={handleSync}
                syncingLists={syncingLists}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
