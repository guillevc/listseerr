import { useState, useEffect, useRef } from 'react';
import { trpc } from '../lib/trpc';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Trash2, Pause, Play, RefreshCw } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { cn } from '../lib/utils';

type LogLevel = 'all' | 'debug' | 'info' | 'warn' | 'error';

const levelColors: Record<string, string> = {
  debug: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  info: 'bg-green-500/10 text-green-500 border-green-500/20',
  warn: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  error: 'bg-red-500/10 text-red-500 border-red-500/20',
  fatal: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

export function LogsPage() {
  const [logLevel, setLogLevel] = useState<LogLevel>('all');
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get configured timezone
  const { data: settings } = trpc.generalSettings.get.useQuery();
  const timezone = settings?.timezone || 'UTC';

  const { data: logs, refetch } = trpc.logs.getLogs.useQuery(
    { limit: 500, level: logLevel },
    {
      refetchInterval: isPaused ? false : 2000,
      refetchIntervalInBackground: false,
    }
  );

  const clearLogsMutation = trpc.logs.clearLogs.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Logs cleared successfully',
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to clear logs',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      clearLogsMutation.mutate();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(',', '');
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-8 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Server Logs</h1>
          <p className="text-muted-foreground mt-1">
            Real-time server logs with filtering capabilities (Timezone: {timezone})
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Live Logs</CardTitle>
                <CardDescription>
                  Auto-refreshes every 2 seconds {isPaused && '(Paused)'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={logLevel} onValueChange={(val) => setLogLevel(val as LogLevel)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Log level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="debug">Debug+</SelectItem>
                    <SelectItem value="info">Info+</SelectItem>
                    <SelectItem value="warn">Warn+</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsPaused(!isPaused)}
                  title={isPaused ? 'Resume' : 'Pause'}
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => refetch()}
                  title="Refresh now"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>

                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleClearLogs}
                  disabled={clearLogsMutation.isPending}
                  title="Clear logs"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <div>
                  {logs?.length || 0} log {logs?.length === 1 ? 'entry' : 'entries'}
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="rounded"
                  />
                  <span>Auto-scroll</span>
                </label>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 max-h-[600px] overflow-y-auto font-mono text-xs">
                {!logs || logs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No logs available
                  </div>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex gap-3 hover:bg-muted/50 p-2 rounded transition-colors"
                      >
                        <div className="text-muted-foreground whitespace-nowrap">
                          {formatTimestamp(log.timestamp)}
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            'font-mono uppercase whitespace-nowrap',
                            levelColors[log.level] || 'bg-gray-500/10 text-gray-500'
                          )}
                        >
                          {log.level}
                        </Badge>
                        {log.module && (
                          <Badge variant="secondary" className="font-mono whitespace-nowrap">
                            {log.module}
                          </Badge>
                        )}
                        <div className="flex-1 break-all">{log.msg}</div>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {logs && logs.length > 0 && logs[0].data && (
          <Card>
            <CardHeader>
              <CardTitle>Latest Log Details</CardTitle>
              <CardDescription>Additional data from the most recent log entry</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted/30 rounded-lg p-4 overflow-x-auto text-xs">
                {JSON.stringify(logs[0].data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
