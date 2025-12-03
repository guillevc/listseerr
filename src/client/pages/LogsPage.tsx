import { useState, useEffect, useRef } from 'react';
import { trpc, type RouterOutputs } from '../lib/trpc';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Trash2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

type LogEntry = RouterOutputs['logs']['getLogs'][0];

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
  const { toast } = useToast();

  const { data: logs, refetch } = trpc.logs.getLogs.useQuery(
    { limit: 1000, level: 'all' },
    {
      refetchInterval: 2000,
      refetchIntervalInBackground: false,
    }
  );

  const clearLogsMutation = trpc.logs.clearLogs.useMutation({
    onSuccess: () => {
      toast({
        title: 'Logs Cleared',
        description: 'All logs have been removed',
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
          <div key={key} className="text-gray-400">
            {'    '}{key}: null
          </div>
        );
      } else if (value === undefined) {
        lines.push(
          <div key={key} className="text-gray-400">
            {'    '}{key}: undefined
          </div>
        );
      } else if (typeof value === 'string') {
        lines.push(
          <div key={key} className="text-gray-400">
            {'    '}{key}: {`"${value}"`}
          </div>
        );
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        lines.push(
          <div key={key} className="text-gray-400">
            {'    '}{key}: {value}
          </div>
        );
      } else if (Array.isArray(value)) {
        lines.push(
          <div key={key} className="text-gray-400">
            {'    '}{key}: {JSON.stringify(value)}
          </div>
        );
      } else if (typeof value === 'object') {
        // Nested object
        lines.push(
          <div key={key} className="text-gray-400">
            {'    '}{key}: {'{'}
          </div>
        );
        const entries = Object.entries(value);
        entries.forEach(([k, v], idx) => {
          const isLast = idx === entries.length - 1;
          const comma = isLast ? '' : ',';
          lines.push(
            <div key={`${key}.${k}`} className="text-gray-400">
              {'      '}{`"${k}"`}: {typeof v === 'string' ? `"${v}"` : typeof v === 'number' || typeof v === 'boolean' ? v : JSON.stringify(v)}{comma}
            </div>
          );
        });
        lines.push(
          <div key={`${key}-close`} className="text-gray-400">
            {'    '}{'}'}
          </div>
        );
      }
    });

    return lines;
  };

  // Format log entry with colors like console
  const renderLogEntry = (log: LogEntry, index: number) => {
    const timestamp = formatTimestamp(log.timestamp);
    const levelColor = levelColors[log.level] || 'text-gray-400';

    return (
      <div key={log.id || index} className="mb-1">
        <div>
          <span className="text-gray-500">[{timestamp}]</span>
          {' '}
          <span className={`font-semibold ${levelColor}`}>{log.level.toUpperCase()}:</span>
          {' '}
          <span className="text-gray-200">{log.msg}</span>
        </div>
        {log.data && Object.keys(log.data).length > 0 && (
          <div>{formatData(log.data)}</div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-8 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Server Logs</h1>
          <p className="text-muted-foreground mt-1">
            Real-time server logs (auto-refreshes every 2 seconds)
          </p>
        </div>

        <Card className="bg-black border-gray-800">
          <CardContent className="p-0">
            {/* Controls Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-scroll"
                  checked={autoScroll}
                  onCheckedChange={setAutoScroll}
                />
                <Label htmlFor="auto-scroll" className="cursor-pointer text-gray-400 text-sm">
                  Auto-scroll
                </Label>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearLogs}
                disabled={clearLogsMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Logs
              </Button>
            </div>

            {/* Logs Display */}
            <div
              className="p-4 h-[calc(100vh-280px)] overflow-y-auto font-mono text-xs whitespace-pre"
              style={{ fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace' }}
            >
              {!logs || logs.length === 0 ? (
                <div className="text-gray-500">No logs available</div>
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
    </div>
  );
}
