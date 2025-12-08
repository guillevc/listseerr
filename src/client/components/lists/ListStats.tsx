import { useListsStats } from '../../hooks/use-lists-stats';

interface MediaList {
  enabled: boolean;
  [key: string]: unknown;
}

interface ListStatsProps {
  lists: MediaList[];
}

export function ListStats({ lists }: ListStatsProps) {
  const { total, enabled, disabled } = useListsStats(lists);

  return (
    <div className="flex items-center gap-2 text-sm text-light-tx-2 dark:text-dark-tx-2">
      <span className="font-medium text-light-tx dark:text-dark-tx">{total} All</span>
      <span>•</span>
      <span className="font-medium text-green-600">
        {enabled} Enabled
      </span>
      <span>•</span>
      <span className="font-medium">{disabled} Disabled</span>
    </div>
  );
}
