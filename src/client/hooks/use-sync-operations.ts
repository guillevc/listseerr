import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { useToast } from './use-toast';

interface MediaList {
  id: number;
  enabled: boolean;
  [key: string]: any;
}

interface JellyseerrConfig {
  url: string;
  apiKey: string;
  userIdJellyseerr: number;
}

export function useSyncOperations() {
  const [syncingLists, setSyncingLists] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  // Get Jellyseerr config
  const { data: jellyseerrConfig } = trpc.config.get.useQuery();

  // Sync mutation
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

  const handleSync = async (id: number, lists: MediaList[]) => {
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

  const handleSyncAll = async (lists: MediaList[]) => {
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
      await handleSync(list.id, lists);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  return {
    syncingLists,
    handleSync,
    handleSyncAll,
    jellyseerrConfig,
  };
}
