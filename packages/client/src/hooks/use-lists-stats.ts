import { useMemo } from 'react';

interface MediaList {
  enabled: boolean;
  [key: string]: unknown;
}

interface UseListsStatsOptions {
  jellyseerrConfigured?: boolean;
}

export function useListsStats(lists: MediaList[], options: UseListsStatsOptions = {}) {
  const { jellyseerrConfigured = true } = options;

  return useMemo(() => {
    const total = lists.length;
    // If Jellyseerr is not configured, all lists count as disabled
    const enabled = jellyseerrConfigured ? lists.filter((list) => list.enabled).length : 0;
    const disabled = total - enabled;

    return {
      total,
      enabled,
      disabled,
    };
  }, [lists, jellyseerrConfigured]);
}
