import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { List, CheckCircle, Clock, PackageSearch } from 'lucide-react';
import { useListsStats } from '../../hooks/use-lists-stats';

interface MediaList {
  enabled: boolean;
  lastProcessed?: Date | null;
  [key: string]: any;
}

interface DashboardStatsProps {
  lists: MediaList[];
}

export function DashboardStats({ lists }: DashboardStatsProps) {
  const { total, enabled } = useListsStats(lists);

  // Calculate last processed time
  const lastProcessedDate = lists
    .map((list) => list.lastProcessed ? new Date(list.lastProcessed).getTime() : 0)
    .sort((a, b) => b - a)[0];

  const lastProcessedText = lastProcessedDate
    ? new Date(lastProcessedDate).toLocaleString()
    : 'Never';

  const stats = [
    {
      title: 'Total Lists',
      value: total,
      icon: List,
      description: 'Total media lists',
    },
    {
      title: 'Enabled Lists',
      value: enabled,
      icon: CheckCircle,
      description: 'Currently active',
      valueColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Processed',
      value: lastProcessedText,
      icon: Clock,
      description: 'Most recent',
      isTime: true,
    },
    {
      title: 'Total Items',
      value: '-',
      icon: PackageSearch,
      description: 'Coming soon',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.valueColor || ''} ${stat.isTime ? 'text-base' : ''}`}>
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
