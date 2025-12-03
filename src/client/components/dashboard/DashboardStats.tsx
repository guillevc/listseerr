import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { List, CheckCircle, Clock, PackageSearch } from 'lucide-react';
import { useListsStats } from '../../hooks/use-lists-stats';
import { trpc } from '../../lib/trpc';

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
  const { data: dashboardStats } = trpc.dashboard.getStats.useQuery();

  // Get last scheduled processing time from stats
  const lastScheduledText = dashboardStats?.lastScheduledProcessing
    ? new Date(dashboardStats.lastScheduledProcessing).toLocaleString()
    : 'Never';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Lists Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Lists Overview
          </CardTitle>
          <List className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{total}</span>
              <span className="text-sm text-muted-foreground">total</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {enabled} enabled
              </span>
              {total > enabled && (
                <span className="text-xs text-muted-foreground">
                  · {total - enabled} disabled
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Auto Processing */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Last Auto Processing
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold min-h-[2rem] flex items-center text-sm text-muted-foreground">
            {lastScheduledText}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Automatic processing only
          </p>
        </CardContent>
      </Card>

      {/* Total Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Requests
          </CardTitle>
          <PackageSearch className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold min-h-[2rem] flex items-center text-2xl text-blue-600 dark:text-blue-400">
            {dashboardStats?.totalRequestedItems ?? '-'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Items requested
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
