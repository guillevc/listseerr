import { useMemo } from 'react';

interface MediaList {
  enabled: boolean;
  [key: string]: unknown;
}

export function useListsStats(lists: MediaList[]) {
  return useMemo(() => {
    const total = lists.length;
    const enabled = lists.filter((list) => list.enabled).length;
    const disabled = total - enabled;

    return {
      total,
      enabled,
      disabled,
    };
  }, [lists]);
}
