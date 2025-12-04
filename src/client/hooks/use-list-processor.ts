import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { useToast } from './use-toast';

interface MediaList {
  id: number;
  enabled: boolean;
  [key: string]: unknown;
}

export function useListProcessor() {
  const [processingLists, setProcessingLists] = useState<Set<number>>(new Set());
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // Get Jellyseerr config
  const { data: jellyseerrConfig, isLoading: isLoadingConfig } = trpc.config.get.useQuery();

  // Process single list mutation
  const processMutation = trpc.processor.processList.useMutation({
    onSuccess: (result, variables) => {
      setProcessingLists((prev) => {
        const next = new Set(prev);
        next.delete(variables.listId);
        return next;
      });

      // Invalidate queries to refresh UI
      utils.lists.getAll.invalidate();
      utils.dashboard.getStats.invalidate();
      utils.dashboard.getRecentActivity.invalidate();

      if (result.success) {
        const skipped = result.itemsFound - result.itemsRequested - result.itemsFailed;
        const parts = [`Found ${result.itemsFound} items`];

        if (result.itemsRequested > 0) {
          parts.push(`${result.itemsRequested} requested`);
        }
        if (skipped > 0) {
          parts.push(`${skipped} skipped`);
        }
        if (result.itemsFailed > 0) {
          parts.push(`${result.itemsFailed} failed`);
        }

        toast({
          title: 'Processing Complete',
          description: parts.join(', '),
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

  // Process all lists mutation (batch processing)
  const processAllMutation = trpc.processor.processAll.useMutation({
    onSuccess: (result) => {
      setProcessingLists(new Set()); // Clear all processing lists

      // Invalidate queries to refresh UI
      utils.lists.getAll.invalidate();
      utils.dashboard.getStats.invalidate();
      utils.dashboard.getRecentActivity.invalidate();

      if (result.success) {
        const parts = [`Processed ${result.processedLists} list(s)`];

        if (result.itemsRequested > 0) {
          parts.push(`${result.itemsRequested} requested`);
        }
        if (result.itemsFailed > 0) {
          parts.push(`${result.itemsFailed} failed`);
        }

        toast({
          title: 'Batch Processing Complete',
          description: parts.join(', '),
        });
      }
    },
    onError: (error) => {
      setProcessingLists(new Set()); // Clear all processing lists

      toast({
        title: 'Batch Processing Failed',
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
    processMutation.mutate({ listId: id, triggerType: 'manual' });
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

    // Mark all enabled lists as processing
    setProcessingLists(new Set(enabledLists.map(l => l.id)));

    toast({
      title: 'Processing All Lists',
      description: `Processing ${enabledLists.length} list(s) as a batch`,
    });

    // Use batch processing mutation
    processAllMutation.mutate();
  };

  return {
    processingLists,
    handleProcess,
    handleProcessAll,
    jellyseerrConfig,
    isLoadingConfig,
  };
}
