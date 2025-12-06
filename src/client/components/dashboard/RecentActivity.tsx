import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Activity, CheckCircle, XCircle, AlertCircle, Clock, Calendar } from 'lucide-react';
import { trpc } from '../../lib/trpc';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

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
          <div className="text-center py-8 text-muted-foreground">
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
          <div className="text-center py-8 text-muted-foreground">
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
                className="rounded-lg border bg-card"
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
                    <span className="text-sm text-muted-foreground">
                      {group.executions.length} {group.executions.length === 1 ? 'list' : 'lists'} processed
                    </span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="text-sm text-muted-foreground cursor-help">
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
                        <TableHead className="w-1/5">List</TableHead>
                        <TableHead className="text-right w-1/5">Items</TableHead>
                        <TableHead className="text-right w-1/5">Requested</TableHead>
                        <TableHead className="text-right w-1/5">Skipped</TableHead>
                        <TableHead className="text-right w-1/5">Failed</TableHead>
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
                            <TableCell className="font-medium w-1/5">
                              <div className="line-clamp-3 break-words">
                                {execution.listName || `List #${execution.listId}`}
                              </div>
                            </TableCell>
                            <TableCell className="text-right w-1/5">
                              {execution.itemsFound ?? 0}
                            </TableCell>
                            <TableCell className="text-right w-1/5">
                              <div className="flex items-center justify-end gap-1">
                                <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                                <span>{execution.itemsRequested ?? 0}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right w-1/5">
                              <div className="flex items-center justify-end gap-1">
                                <AlertCircle className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                <span>{itemsSkipped}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right w-1/5">
                              <div className="flex items-center justify-end gap-1">
                                <XCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
                                <span>{execution.itemsFailed ?? 0}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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
