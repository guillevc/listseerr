import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { List, Clock, PackageSearch, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Separator } from '../ui/separator';
import { trpc } from '../../lib/trpc';
import { getRelativeTime } from '../../lib/utils';
import { useProviderConfig } from '../../hooks/use-provider-config';
import type { SerializedMediaList } from 'shared/application/dtos/core/media-list.dto';

interface DashboardStatsProps {
  lists: SerializedMediaList[];
}

export function DashboardStats({ lists }: DashboardStatsProps) {
  const { data: dashboardStats } = trpc.dashboard.getStats.useQuery();
  const { isProviderConfigured } = useProviderConfig();

  // Calculate active lists (enabled AND provider is configured)
  const activeListsCount = lists.filter((list) => {
    if (!list.enabled) return false;
    return isProviderConfigured(list.provider);
  }).length;

  // Get last scheduled processing time from stats
  const lastScheduledDate = dashboardStats?.lastScheduledProcessing
    ? new Date(dashboardStats.lastScheduledProcessing)
    : null;

  const lastScheduledText = getRelativeTime(lastScheduledDate);
  const lastScheduledFullDate = lastScheduledDate ? lastScheduledDate.toLocaleString() : 'Never';

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
      <Link to="/lists" className="lg:col-span-1">
        <Card className="h-full transition-colors hover:border-border-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lists</CardTitle>
            <div className="flex items-center gap-1">
              <List className="h-4 w-4 text-muted" />
              <ChevronRight className="h-4 w-4 text-muted" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-1 text-xs text-muted">Active</p>
            <div className="text-2xl font-bold">{activeListsCount}</div>
          </CardContent>
        </Card>
      </Link>

      {/* Requests */}
      <Card className="hover:border-border-hover lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Requests</CardTitle>
          <PackageSearch className="h-4 w-4 text-muted" />
        </CardHeader>
        <CardContent>
          <p className="mb-1 text-xs text-muted">Total</p>
          <div className="text-2xl font-bold text-green-600">
            {dashboardStats?.totalRequestedItems ?? '-'}
          </div>
        </CardContent>
      </Card>

      {/* Automatic Processing - Merged Card */}
      <Link to="/settings/automatic-processing" className="md:col-span-2 lg:col-span-2">
        <Card className="h-full transition-colors hover:border-border-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automatic Processing</CardTitle>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted" />
              <ChevronRight className="h-4 w-4 text-muted" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-6">
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs text-muted">Last execution</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help truncate text-2xl font-bold">
                        {lastScheduledText}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{lastScheduledFullDate}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <Separator orientation="vertical" className="h-12" />

              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs text-muted">Next execution</p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help truncate text-2xl font-bold">
                        {nextScheduledText}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{nextScheduledFullDate}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
