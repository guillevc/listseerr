import { RefreshCw, Trash2, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { MediaList } from '../types';
import { getProviderName, getProviderColor } from '../lib/url-validator';

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
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (list.lastSyncStatus === 'success') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (list.lastSyncStatus === 'error') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  return (
    <Card className={list.enabled ? '' : 'opacity-60'}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl">{list.name}</CardTitle>
              <span
                className={`text-xs px-2 py-1 rounded text-white ${getProviderColor(
                  list.provider
                )}`}
              >
                {getProviderName(list.provider)}
              </span>
            </div>
            <CardDescription className="flex items-center gap-2 break-all">
              <a
                href={list.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1"
              >
                {list.url.substring(0, 60)}
                {list.url.length > 60 ? '...' : ''}
                <ExternalLink className="h-3 w-3" />
              </a>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            {getStatusIcon()}
            <span className="text-muted-foreground">
              Last sync: {formatDate(list.lastSync)}
            </span>
          </div>

          {list.lastSyncError && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-2 rounded">
              {list.lastSyncError}
            </div>
          )}

          {list.itemCount !== undefined && (
            <div className="text-sm text-muted-foreground">
              {list.itemCount} item{list.itemCount !== 1 ? 's' : ''} in list
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSync(list.id)}
              disabled={!list.enabled || isSyncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync Now
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onToggleEnabled(list.id)}
            >
              {list.enabled ? 'Disable' : 'Enable'}
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
      </CardContent>
    </Card>
  );
}
