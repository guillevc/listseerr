import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Activity, CheckCircle, XCircle, AlertCircle, Clock, Calendar } from 'lucide-react';
import { trpc } from '../../lib/trpc';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

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
            Recent list processing and events
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
            Recent list processing and events
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
            const isBatch = group.executions.length > 1;
            const timestamp = new Date(group.timestamp);

            return (
              <div
                key={`group-${groupIdx}`}
                className="rounded-lg border"
              >
                {/* Group header */}
                <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
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
                    {isBatch && (
                      <span className="text-xs text-muted-foreground">
                        {group.executions.length} lists
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(timestamp)}
                  </span>
                </div>

                {/* Executions */}
                <div className="divide-y">
                  {group.executions.map((execution) => {
                    const itemsSkipped =
                      (execution.itemsFound || 0) -
                      (execution.itemsRequested || 0) -
                      (execution.itemsFailed || 0);

                    return (
                      <div
                        key={execution.id}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors"
                      >
                        {/* Status icon */}
                        <div>
                          {execution.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : execution.status === 'error' ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>

                        {/* Execution details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {execution.listName || `List #${execution.listId}`}
                          </p>

                          {execution.status === 'success' ? (
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-0.5">
                              {execution.itemsRequested > 0 && (
                                <span>{execution.itemsRequested} requested</span>
                              )}
                              {itemsSkipped > 0 && (
                                <span>{itemsSkipped} skipped</span>
                              )}
                              {(execution.itemsFailed || 0) > 0 && (
                                <span className="text-red-600">{execution.itemsFailed} failed</span>
                              )}
                            </div>
                          ) : execution.status === 'error' ? (
                            <p className="text-xs text-red-600 mt-0.5 truncate">
                              {execution.errorMessage || 'Processing failed'}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Processing...
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
