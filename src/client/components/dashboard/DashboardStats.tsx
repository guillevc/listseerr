import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { List, CheckCircle, Clock, PackageSearch } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { useListsStats } from '../../hooks/use-lists-stats';
import { trpc } from '../../lib/trpc';
import { getRelativeTime } from '../../lib/utils';

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
  const lastScheduledDate = dashboardStats?.lastScheduledProcessing
    ? new Date(dashboardStats.lastScheduledProcessing)
    : null;

  const lastScheduledText = getRelativeTime(lastScheduledDate);
  const lastScheduledFullDate = lastScheduledDate
    ? lastScheduledDate.toLocaleString()
    : 'Never';

  // Get next scheduled processing time from stats
  const nextScheduledDate = dashboardStats?.nextScheduledProcessing
    ? new Date(dashboardStats.nextScheduledProcessing)
    : null;

  const nextScheduledText = getRelativeTime(nextScheduledDate);
  const nextScheduledFullDate = nextScheduledDate
    ? nextScheduledDate.toLocaleString()
    : 'Not scheduled';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Lists */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Lists
          </CardTitle>
          <List className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
        </CardContent>
      </Card>

      {/* Last Automatic Processing */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Last Automatic Processing
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-2xl font-bold cursor-help">
                  {lastScheduledText}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{lastScheduledFullDate}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Next Automatic Processing */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Next Automatic Processing
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-2xl font-bold cursor-help">
                  {nextScheduledText}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{nextScheduledFullDate}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {dashboardStats?.totalRequestedItems ?? '-'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
