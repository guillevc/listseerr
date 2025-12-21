import { useState, useEffect, useRef, useMemo, type JSX } from 'react';
import { trpc, type RouterOutputs } from '../lib/trpc';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

type LogEntry = RouterOutputs['logs']['getLogs']['logs'][0];

const levelColors: Record<string, string> = {
  debug: 'text-blue-400',
  info: 'text-green-400',
  warn: 'text-yellow-400',
  error: 'text-red-400',
  fatal: 'text-purple-400',
};

export function LogsPage() {
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data, refetch } = trpc.logs.getLogs.useQuery(
    { limit: 1000, level: 'info' },
    {
      refetchInterval: 2000,
      refetchIntervalInBackground: false,
    }
  );
  const logs = useMemo(() => data?.logs ?? [], [data?.logs]);

  const clearLogsMutation = trpc.logs.clearLogs.useMutation({
    onSuccess: () => {
      toast({
        title: 'Logs Cleared',
        description: 'All logs have been removed',
      });
      void refetch();
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
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Format timestamp to match console: [2025-12-03 10:22:09]
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Format data object to match console output
  const formatData = (data: Record<string, unknown>) => {
    const lines: JSX.Element[] = [];

    Object.entries(data).forEach(([key, value]) => {
      if (value === null) {
        lines.push(
          <div key={key} className="text-muted">
            {'    '}
            {key}: null
          </div>
        );
      } else if (value === undefined) {
        lines.push(
          <div key={key} className="text-muted">
            {'    '}
            {key}: undefined
          </div>
        );
      } else if (typeof value === 'string') {
        lines.push(
          <div key={key} className="text-muted">
            {'    '}
            {key}: {`"${value}"`}
          </div>
        );
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        lines.push(
          <div key={key} className="text-muted">
            {'    '}
            {key}: {value}
          </div>
        );
      } else if (Array.isArray(value)) {
        lines.push(
          <div key={key} className="text-muted">
            {'    '}
            {key}: {JSON.stringify(value)}
          </div>
        );
      } else if (typeof value === 'object') {
        // Nested object
        lines.push(
          <div key={key} className="text-muted">
            {'    '}
            {key}: {'{'}
          </div>
        );
        const entries = Object.entries(value);
        entries.forEach(([k, v], idx) => {
          const isLast = idx === entries.length - 1;
          const comma = isLast ? '' : ',';
          lines.push(
            <div key={`${key}.${k}`} className="text-muted">
              {'      '}
              {`"${k}"`}:{' '}
              {typeof v === 'string'
                ? `"${v}"`
                : typeof v === 'number' || typeof v === 'boolean'
                  ? v
                  : JSON.stringify(v)}
              {comma}
            </div>
          );
        });
        lines.push(
          <div key={`${key}-close`} className="text-muted">
            {'    '}
            {'}'}
          </div>
        );
      }
    });

    return lines;
  };

  // Format log entry with colors like console
  const renderLogEntry = (log: LogEntry, index: number) => {
    const timestamp = formatTimestamp(log.timestamp);
    const levelColor = levelColors[log.level] || 'text-muted';

    return (
      <div key={log.id || index} className="mb-1">
        <div>
          <span className="text-muted">[{timestamp}]</span>{' '}
          <span className={`font-semibold ${levelColor}`}>{log.level.toUpperCase()}</span>
          {log.module && <span className="text-cyan-400"> ({log.module})</span>}
          <span className="text-muted">:</span> <span className="text-foreground">{log.msg}</span>
        </div>
        {log.data && Object.keys(log.data).length > 0 && <div>{formatData(log.data)}</div>}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Server Logs</h1>
        <p className="mt-1 text-muted">Live updates every 2 seconds</p>
      </div>

      <Card className="border-light-ui bg-background dark:border-dark-ui">
        <CardContent className="p-0">
          {/* Controls Bar */}
          <div className="flex items-center justify-between border-b border-light-ui px-4 py-3 dark:border-dark-ui">
            <div className="flex items-center gap-2">
              <Switch id="auto-scroll" checked={autoScroll} onCheckedChange={setAutoScroll} />
              <Label htmlFor="auto-scroll" className="cursor-pointer text-sm text-muted">
                Auto-scroll
              </Label>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" loading={clearLogsMutation.isPending}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Logs
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all logs?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all server logs. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => clearLogsMutation.mutate()}>
                    Clear Logs
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Logs Display */}
          <div
            ref={logsContainerRef}
            className="h-[calc(100vh-280px)] overflow-y-auto p-4 font-mono text-xs whitespace-pre"
            style={{
              fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace',
            }}
          >
            {!logs || logs.length === 0 ? (
              <div className="text-muted">No logs available</div>
            ) : (
              <div>
                {/* Reverse logs so newest is at the bottom (like terminal) */}
                {[...logs].reverse().map((log, index) => renderLogEntry(log, index))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
