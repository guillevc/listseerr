import { RefreshCw, Trash2, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { MediaList } from '../types';
import { getProviderName, getProviderColor } from '../lib/url-validator';
import { getRelativeTime } from '../lib/utils';

interface Props {
  list: MediaList;
  onSync: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleEnabled: (id: string) => void;
  isSyncing: boolean;
}

export function ListCard({ list, onSync, onDelete, onToggleEnabled, isSyncing }: Props) {
  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleString();
  };

  const getStatusIcon = () => {
    if (isSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin text-primary" />;
    }
    if (list.lastSyncStatus === 'success') {
      return <CheckCircle className="h-4 w-4 text-flexoki-green" />;
    }
    if (list.lastSyncStatus === 'error') {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card className={list.enabled ? '' : 'opacity-60'}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xl font-semibold">{list.name}</h3>
              <span
                className={`text-xs px-2 py-1 rounded text-white flex-shrink-0 ${getProviderColor(
                  list.provider
                )}`}
              >
                {getProviderName(list.provider)}
              </span>
              {getStatusIcon()}
            </div>
            <a
              href={list.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 break-all"
            >
              {list.url.substring(0, 70)}
              {list.url.length > 70 ? '...' : ''}
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={`enabled-${list.id}`} className="text-sm text-muted-foreground cursor-pointer">
                {list.enabled ? 'Enabled' : 'Disabled'}
              </Label>
              <Switch
                id={`enabled-${list.id}`}
                checked={list.enabled}
                onCheckedChange={() => onToggleEnabled(list.id)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-help">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{getRelativeTime(list.lastSync)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{formatDate(list.lastSync)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {list.itemCount !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">{list.itemCount}</span>
              <span>item{list.itemCount !== 1 ? 's' : ''}</span>
            </div>
          )}
          {list.maxItems && (
            <div className="flex items-center gap-1.5">
              <span>Max:</span>
              <span className="font-medium text-foreground">{list.maxItems}</span>
            </div>
          )}
        </div>

        {list.lastSyncError && (
          <div className="text-sm text-destructive bg-red-50 dark:bg-red-950 p-3 rounded mb-4">
            {list.lastSyncError}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSync(list.id)}
            disabled={!list.enabled || isSyncing}
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(list.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
