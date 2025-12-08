import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Activity, CheckCircle, XCircle, AlertCircle, Clock, Calendar } from 'lucide-react';
import { trpc } from '../../lib/trpc';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface ProcessingBarProps {
  requested: number;
  skipped: number;
  failed: number;
}

function ProcessingBar({ requested, skipped, failed }: ProcessingBarProps) {
  const total = requested + skipped + failed;

  if (total === 0) {
    return (
      <div className="h-8 w-full bg-card rounded-md flex items-center justify-center">
        <span className="text-xs text-muted">No items</span>
      </div>
    );
  }

  const requestedPercent = (requested / total) * 100;
  const skippedPercent = (skipped / total) * 100;
  const failedPercent = (failed / total) * 100;

  // Only show number if segment is wide enough (at least 8% of total width)
  const showRequestedNumber = requestedPercent >= 8;
  const showSkippedNumber = skippedPercent >= 8;
  const showFailedNumber = failedPercent >= 8;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="h-8 w-full bg-card rounded-md overflow-hidden flex cursor-help">
            {requested > 0 && (
              <div
                className="bg-green-600 h-full flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${requestedPercent}%` }}
              >
                {showRequestedNumber && <span>{requested}</span>}
              </div>
            )}
            {skipped > 0 && (
              <div
                className="bg-blue-500 h-full flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${skippedPercent}%` }}
              >
                {showSkippedNumber && <span>{skipped}</span>}
              </div>
            )}
            {failed > 0 && (
              <div
                className="bg-red-600 h-full flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${failedPercent}%` }}
              >
                {showFailedNumber && <span>{failed}</span>}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Requested: {requested} ({requestedPercent.toFixed(1)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-blue-500" />
              <span>Skipped: {skipped} ({skippedPercent.toFixed(1)}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-3 w-3 text-red-600" />
              <span>Failed: {failed} ({failedPercent.toFixed(1)}%)</span>
            </div>
          </div>
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
  const { data: activityGroups, isLoading } = trpc.dashboard.getRecentActivity.useQuery({
    limit: 20,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Recent list processing and events (last 24 hours)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
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
          <CardDescription>
            Recent list processing and events (last 24 hours)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted">
            <p>No recent activity</p>
            <p className="text-sm mt-1">Processing activity will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Recent list processing and events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activityGroups.map((group, groupIdx) => {
            const timestamp = new Date(group.timestamp);

            return (
              <div
                key={`group-${groupIdx}`}
                className="rounded-lg border border-hover"
              >
                {/* Group header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <Badge variant={group.triggerType === 'scheduled' ? 'default' : 'secondary'} className="text-xs">
                      {group.triggerType === 'scheduled' ? (
                        <>
                          <Calendar className="h-3 w-3 mr-1" />
                          Scheduled
                        </>
                      ) : (
                        'Manual'
                      )}
                    </Badge>
                    <span className="text-sm text-muted">
                      {group.executions.length} {group.executions.length === 1 ? 'list' : 'lists'} processed
                    </span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm text-muted cursor-help">
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
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>List</TableHead>
                        <TableHead className="text-right">Items Found</TableHead>
                        <TableHead className="w-[300px]">Processing Results</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.executions.map((execution) => {
                        const itemsSkipped =
                          (execution.itemsFound ?? 0) -
                          (execution.itemsRequested ?? 0) -
                          (execution.itemsFailed ?? 0);

                        return (
                          <TableRow key={execution.id}>
                            <TableCell className="font-medium">
                              <div className="line-clamp-3 wrap-break-word">
                                {execution.listName || `List #${execution.listId}`}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {execution.itemsFound ?? 0}
                            </TableCell>
                            <TableCell className="w-[500px]">
                              <ProcessingBar
                                requested={execution.itemsRequested ?? 0}
                                skipped={itemsSkipped}
                                failed={execution.itemsFailed ?? 0}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {/* Batch Summary Row (only show if multiple lists in batch) */}
                      {group.executions.length > 1 && (() => {
                        const totalFound = group.executions.reduce((sum, e) => sum + (e.itemsFound ?? 0), 0);
                        const totalRequested = group.executions.reduce((sum, e) => sum + (e.itemsRequested ?? 0), 0);
                        const totalFailed = group.executions.reduce((sum, e) => sum + (e.itemsFailed ?? 0), 0);
                        const totalSkipped = totalFound - totalRequested - totalFailed;

                        return (
                          <TableRow className="bg-card/50 font-semibold border-t-2">
                            <TableCell>Batch Total</TableCell>
                            <TableCell className="text-right">{totalFound}</TableCell>
                            <TableCell className="w-[500px]">
                              <ProcessingBar
                                requested={totalRequested}
                                skipped={totalSkipped}
                                failed={totalFailed}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })()}
                    </TableBody>
                  </Table>
                </div>

                {/* Show error messages if any */}
                {group.executions.some((e) => e.errorMessage) && (
                  <div className="p-4 border-t space-y-2">
                    {group.executions
                      .filter((e) => e.errorMessage)
                      .map((e) => (
                        <div key={e.id} className="text-sm text-red-600">
                          <strong>{e.listName || `List #${e.listId}`}:</strong> {e.errorMessage}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
