import { MediaList, JellyseerrConfig } from '../types';
import { JellyseerrService } from './jellyseerr';
import { fetchListItems } from './list-providers';

export interface SyncResult {
  success: boolean;
  itemCount?: number;
  requestedCount?: number;
  error?: string;
}

export async function syncList(
  list: MediaList,
  jellyseerrConfig: JellyseerrConfig
): Promise<SyncResult> {
  try {
    let items = await fetchListItems(list.provider, list.url);

    if (items.length === 0) {
      return {
        success: true,
        itemCount: 0,
        requestedCount: 0,
      };
    }

    const totalItems = items.length;

    if (list.maxItems && list.maxItems > 0) {
      items = items.slice(0, list.maxItems);
    }

    const jellyseerrService = new JellyseerrService(jellyseerrConfig);
    let requestedCount = 0;

    for (const item of items) {
      if (!item.tmdbId) continue;

      const isRequested = await jellyseerrService.checkIfRequested(
        item.tmdbId,
        item.mediaType
      );

      if (!isRequested) {
        const result = await jellyseerrService.requestMedia(item);
        if (result.success) {
          requestedCount++;
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return {
      success: true,
      itemCount: items.length,
      requestedCount,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function createSyncScheduler(
  onSync: (listId: string) => Promise<void>,
  intervalMinutes: number = 60
): { start: () => void; stop: () => void } {
  let intervalId: number | null = null;

  return {
    start: () => {
      if (intervalId !== null) return;

      intervalId = window.setInterval(
        () => {
          console.log('Auto-sync triggered');
        },
        intervalMinutes * 60 * 1000
      );
    },
    stop: () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  };
}
