import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { List, Clock, PackageSearch } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Separator } from '../ui/separator';
import { trpc } from '../../lib/trpc';
import { getRelativeTime } from '../../lib/utils';
import type { SerializedMediaList } from 'shared/application/dtos/core/media-list.dto';

interface DashboardStatsProps {
  lists: SerializedMediaList[];
}

export function DashboardStats({ lists }: DashboardStatsProps) {
  const { data: dashboardStats } = trpc.dashboard.getStats.useQuery();

  // Check provider configurations
  const { data: traktData } = trpc.traktConfig.get.useQuery();
  const traktConfig = traktData?.config;
  const { data: mdbListData } = trpc.mdblistConfig.get.useQuery();
  const mdbListConfig = mdbListData?.config;

  // Calculate active lists (enabled AND provider is configured)
  const activeListsCount = lists.filter((list) => {
    if (!list.enabled) return false;

    const isProviderConfigured =
      (list.provider === 'trakt' && !!traktConfig?.clientId) ||
      (list.provider === 'traktChart' && !!traktConfig?.clientId) ||
      (list.provider === 'mdblist' && !!mdbListConfig?.apiKey) ||
      list.provider === 'stevenlu'; // Always configured (no API key needed)

    return isProviderConfigured;
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
      <Card className="hover:border-border-hover lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lists</CardTitle>
          <List className="h-4 w-4 text-muted" />
        </CardHeader>
        <CardContent>
          <p className="mb-1 text-xs text-muted">Total active</p>
          <div className="text-2xl font-bold">{activeListsCount}</div>
        </CardContent>
      </Card>

      {/* Requests */}
      <Card className="hover:border-border-hover lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Requests</CardTitle>
          <PackageSearch className="h-4 w-4 text-muted" />
        </CardHeader>
        <CardContent>
          <p className="mb-1 text-xs text-muted">All time</p>
          <div className="text-2xl font-bold text-green-600">
            {dashboardStats?.totalRequestedItems ?? '-'}
          </div>
        </CardContent>
      </Card>

      {/* Automatic Processing - Merged Card */}
      <Card className="hover:border-border-hover md:col-span-2 lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Automatic Processing</CardTitle>
          <Clock className="h-4 w-4 text-muted" />
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
    </div>
  );
}
