import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { ThemeToggle } from './components/theme-toggle';
import { JellyseerrConfigDialog } from './components/JellyseerrConfigDialog';
import { AddListDialog } from './components/AddListDialog';
import { ListCard } from './components/ListCard';
import { Toaster } from './components/ui/toaster';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useToast } from './hooks/use-toast';
import { MediaList, JellyseerrConfig } from './types';
import { syncList } from './services/sync';

function App() {
  const [lists, setLists] = useLocalStorage<MediaList[]>('listseerr-lists', []);
  const [jellyseerrConfig, setJellyseerrConfig] = useLocalStorage<JellyseerrConfig | null>(
    'listseerr-config',
    null
  );
  const [syncingLists, setSyncingLists] = useState<Set<string>>(new Set());
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [syncInterval] = useState(60);
  const { toast } = useToast();

  useEffect(() => {
    if (!autoSyncEnabled || !jellyseerrConfig) return;

    const intervalId = setInterval(
      () => {
        lists
          .filter((list) => list.enabled)
          .forEach((list) => {
            handleSync(list.id);
          });
      },
      syncInterval * 60 * 1000
    );

    return () => clearInterval(intervalId);
  }, [autoSyncEnabled, jellyseerrConfig, lists, syncInterval]);

  const handleAddList = (newList: Omit<MediaList, 'id'>) => {
    const list: MediaList = {
      ...newList,
      id: Date.now().toString(),
    };
    setLists([...lists, list]);
  };

  const handleDeleteList = (id: string) => {
    setLists(lists.filter((list) => list.id !== id));
    toast({
      title: 'List Removed',
      description: 'The list has been removed successfully',
    });
  };

  const handleToggleEnabled = (id: string) => {
    setLists(
      lists.map((list) =>
        list.id === id ? { ...list, enabled: !list.enabled } : list
      )
    );
  };

  const handleSync = async (id: string) => {
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

    setSyncingLists((prev) => new Set(prev).add(id));

    setLists((currentLists) =>
      currentLists.map((l) =>
        l.id === id ? { ...l, lastSyncStatus: 'syncing' } : l
      )
    );

    const result = await syncList(list, jellyseerrConfig);

    setSyncingLists((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    setLists((currentLists) =>
      currentLists.map((l) =>
        l.id === id
          ? {
              ...l,
              lastSync: new Date(),
              lastSyncStatus: result.success ? 'success' : 'error',
              lastSyncError: result.error,
              itemCount: result.itemCount,
            }
          : l
      )
    );

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
              <JellyseerrConfigDialog
                config={jellyseerrConfig}
                onSave={setJellyseerrConfig}
              />
              <ThemeToggle />
            </div>
          </div>

          {!jellyseerrConfig && (
            <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <AlertCircle className="h-5 w-5" />
                  Configuration Required
                </CardTitle>
                <CardDescription className="text-yellow-700 dark:text-yellow-300">
                  Please configure your Jellyseerr instance to start syncing lists.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2">
              <AddListDialog onAdd={handleAddList} />
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
            <div className="grid gap-4">
              {lists.map((list) => (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ListCard
                    list={list}
                    onSync={handleSync}
                    onDelete={handleDeleteList}
                    onToggleEnabled={handleToggleEnabled}
                    isSyncing={syncingLists.has(list.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
