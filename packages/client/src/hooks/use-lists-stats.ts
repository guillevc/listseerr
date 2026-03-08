import { useMemo } from 'react';

interface MediaList {
  enabled: boolean;
  [key: string]: unknown;
}

interface UseListsStatsOptions {
  seerrConfigured?: boolean;
}

export function useListsStats(lists: MediaList[], options: UseListsStatsOptions = {}) {
  const { seerrConfigured = true } = options;

  return useMemo(() => {
    const total = lists.length;
    // If Seerr is not configured, all lists count as disabled
    const enabled = seerrConfigured ? lists.filter((list) => list.enabled).length : 0;
    const disabled = total - enabled;

    return {
      total,
      enabled,
      disabled,
    };
  }, [lists, seerrConfigured]);
}
