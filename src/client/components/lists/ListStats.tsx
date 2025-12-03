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
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">{total} All</span>
      <span>•</span>
      <span className="font-medium text-green-600 dark:text-green-400">
        {enabled} Enabled
      </span>
      <span>•</span>
      <span className="font-medium">{disabled} Disabled</span>
    </div>
  );
}
