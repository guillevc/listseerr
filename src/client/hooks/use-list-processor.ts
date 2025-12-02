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

export function useListProcessor() {
  const [processingLists, setProcessingLists] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  // Get Jellyseerr config
  const { data: jellyseerrConfig } = trpc.config.get.useQuery();

  // Process mutation
  const processMutation = trpc.processor.processList.useMutation({
    onSuccess: (result, variables) => {
      setProcessingLists((prev) => {
        const next = new Set(prev);
        next.delete(variables.listId);
        return next;
      });

      if (result.success) {
        toast({
          title: 'Processing Complete',
          description: `Checked list and found ${result.itemCount} items. Requested ${result.requestedCount} new items to Jellyseerr.`,
        });
      } else {
        toast({
          title: 'Processing Failed',
          description: result.error || 'Unknown error occurred',
          variant: 'destructive',
        });
      }
    },
    onError: (error, variables) => {
      setProcessingLists((prev) => {
        const next = new Set(prev);
        next.delete(variables.listId);
        return next;
      });

      toast({
        title: 'Processing Failed',
        description: error.message || 'Unknown error occurred',
        variant: 'destructive',
      });
    },
  });

  const handleProcess = async (id: number, lists: MediaList[]) => {
    if (!jellyseerrConfig) {
      toast({
        title: 'Configuration Required',
        description: 'Please configure Jellyseerr before processing lists',
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

    setProcessingLists((prev) => new Set(prev).add(id));
    processMutation.mutate({ listId: id });
  };

  const handleProcessAll = async (lists: MediaList[]) => {
    if (!jellyseerrConfig) {
      toast({
        title: 'Configuration Required',
        description: 'Please configure Jellyseerr before processing lists',
        variant: 'destructive',
      });
      return;
    }

    const enabledLists = lists.filter((list) => list.enabled);
    if (enabledLists.length === 0) {
      toast({
        title: 'No Lists',
        description: 'No enabled lists to process',
      });
      return;
    }

    toast({
      title: 'Processing All Lists',
      description: `Processing ${enabledLists.length} list(s)`,
    });

    for (const list of enabledLists) {
      await handleProcess(list.id, lists);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  return {
    processingLists,
    handleProcess,
    handleProcessAll,
    jellyseerrConfig,
  };
}
