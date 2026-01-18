import { Activity, AlertCircle, Calendar, CheckCircle, Clock, Inbox, XCircle } from 'lucide-react';
import { getProviderDisplayName, isScheduled } from 'shared/domain/logic';
import type { ProviderType } from 'shared/domain/types';
import { trpc } from '../../lib/trpc';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';

interface ProcessingBarProps {
  requested: number;
  skippedPreviouslyRequested: number;
  skippedAvailable: number;
  failed: number;
  errorMessage?: string | null;
}

function ProcessingBar({
  requested,
  skippedPreviouslyRequested,
  skippedAvailable,
  failed,
  errorMessage,
}: ProcessingBarProps) {
  const total = requested + skippedPreviouslyRequested + skippedAvailable + failed;

  if (total === 0) {
    if (errorMessage) {
      return (
        <div className="flex h-6 w-full items-center rounded-md bg-red-600/10 px-2">
          <span className="line-clamp-1 text-xs text-red-600">{errorMessage}</span>
        </div>
      );
    }
    return (
      <div className="flex h-6 w-full items-center justify-center rounded-md bg-card">
        <span className="text-xs text-muted">No items</span>
      </div>
    );
  }

  const requestedPercent = (requested / total) * 100;
  const skippedPreviouslyRequestedPercent = (skippedPreviouslyRequested / total) * 100;
  const skippedAvailablePercent = (skippedAvailable / total) * 100;
  const failedPercent = (failed / total) * 100;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex h-6 w-full cursor-help overflow-hidden rounded-md bg-card">
            <div
              className="flex h-full min-w-6 items-center justify-center bg-gr-2 text-xs font-medium text-foreground"
              style={{ width: `${requestedPercent}%` }}
            >
              <span>{requested}</span>
            </div>
            <div
              className="flex h-full min-w-6 items-center justify-center bg-bl-2 text-xs font-medium text-foreground"
              style={{ width: `${skippedPreviouslyRequestedPercent}%` }}
            >
              <span>{skippedPreviouslyRequested}</span>
            </div>
            <div
              className="flex h-full min-w-6 items-center justify-center bg-pu-2 text-xs font-medium text-foreground"
              style={{ width: `${skippedAvailablePercent}%` }}
            >
              <span>{skippedAvailable}</span>
            </div>
            <div
              className="flex h-full min-w-6 items-center justify-center bg-re-2 text-xs font-medium text-foreground"
              style={{ width: `${failedPercent}%` }}
            >
              <span>{failed}</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>
                Requested: {requested} ({requestedPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <span>
                Previously requested: {skippedPreviouslyRequested} (
                {skippedPreviouslyRequestedPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-purple-500" />
              <span>
                Available: {skippedAvailable} ({skippedAvailablePercent.toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span>
                Failed: {failed} ({failedPercent.toFixed(1)}%)
              </span>
            </div>
          </div>
          <TooltipArrow />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export function RecentActivity() {
  const { data, isLoading } = trpc.dashboard.getRecentActivity.useQuery({
    limit: 20,
  });

  const activityGroups = data?.groups;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted">
            <Clock className="mx-auto mb-2 h-8 w-8 animate-spin" />
            <p>Loading activity...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activityGroups || activityGroups.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Last 24 hours</CardDescription>
        </CardHeader>
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-muted/10 p-4">
              <Inbox className="h-8 w-8 text-muted" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-foreground">No recent activity</h3>
            <p className="max-w-sm text-sm text-muted">Activity will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:border-border-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Last 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activityGroups.map((group, groupIdx) => {
            const timestamp = new Date(group.timestamp);
            const triggerIsScheduled = isScheduled(group.triggerType);
            return (
              <div key={`group-${groupIdx}`}>
                {/* Group header */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={triggerIsScheduled ? 'scheduled' : 'manual'}>
                      {triggerIsScheduled ? (
                        <>
                          <Calendar className="h-3 w-3" />
                          Scheduled
                        </>
                      ) : (
                        'Manual'
                      )}
                    </Badge>
                    <span className="text-sm text-muted">
                      {group.executions.length} {group.executions.length === 1 ? 'list' : 'lists'}{' '}
                      processed
                    </span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex cursor-help items-center gap-1 text-sm text-muted">
                          <Clock className="h-3.5 w-3.5" />
                          {formatRelativeTime(timestamp)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{timestamp.toLocaleString()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Executions Table */}
                <div className="overflow-x-auto rounded-lg rounded-b-lg border border-border hover:border-border-hover">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>List</TableHead>
                        <TableHead className="hidden md:table-cell">Provider</TableHead>
                        <TableHead className="text-right">Items</TableHead>
                        <TableHead className="w-1/4 md:w-1/3">Results</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.executions.map((execution) => (
                        <TableRow key={execution.id}>
                          <TableCell className="font-medium">
                            <span className="line-clamp-1">
                              {execution.listName || `List #${execution.listId}`}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {execution.listProvider && (
                              <Badge variant={execution.listProvider as ProviderType}>
                                {getProviderDisplayName(execution.listProvider as ProviderType)}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{execution.itemsFound ?? 0}</TableCell>
                          <TableCell className="w-1/3 md:w-1/3">
                            <ProcessingBar
                              requested={execution.itemsRequested ?? 0}
                              skippedPreviouslyRequested={
                                execution.itemsSkippedPreviouslyRequested ?? 0
                              }
                              skippedAvailable={execution.itemsSkippedAvailable ?? 0}
                              failed={execution.itemsFailed ?? 0}
                              errorMessage={execution.errorMessage}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Batch Summary Row (only show if multiple lists in batch) */}
                      {group.executions.length > 1 &&
                        (() => {
                          const totalFound = group.executions.reduce(
                            (sum, e) => sum + (e.itemsFound ?? 0),
                            0
                          );
                          const totalRequested = group.executions.reduce(
                            (sum, e) => sum + (e.itemsRequested ?? 0),
                            0
                          );
                          const totalFailed = group.executions.reduce(
                            (sum, e) => sum + (e.itemsFailed ?? 0),
                            0
                          );
                          const totalSkippedPreviouslyRequested = group.executions.reduce(
                            (sum, e) => sum + (e.itemsSkippedPreviouslyRequested ?? 0),
                            0
                          );
                          const totalSkippedAvailable = group.executions.reduce(
                            (sum, e) => sum + (e.itemsSkippedAvailable ?? 0),
                            0
                          );

                          return (
                            <TableRow className="bg-card/50 font-semibold">
                              <TableCell>Batch Total</TableCell>
                              <TableCell className="hidden md:table-cell" />
                              <TableCell className="text-right">{totalFound}</TableCell>
                              <TableCell className="w-1/3 md:w-1/3">
                                <ProcessingBar
                                  requested={totalRequested}
                                  skippedPreviouslyRequested={totalSkippedPreviouslyRequested}
                                  skippedAvailable={totalSkippedAvailable}
                                  failed={totalFailed}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })()}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
