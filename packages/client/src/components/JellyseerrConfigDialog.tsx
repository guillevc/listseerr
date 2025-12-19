import { useState } from 'react';
import { Settings, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';
import { useMinLoading } from '../hooks/use-min-loading';
import { trpc } from '../lib/trpc';

export function JellyseerrConfigDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const utils = trpc.useUtils();
  const { data: configData } = trpc.config.get.useQuery();
  const config = configData?.config;

  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [userId, setUserId] = useState('');

  const testMutation = trpc.config.test.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const saveMutation = trpc.config.set.useMutation({
    onSuccess: () => {
      void utils.config.get.invalidate();
      void utils.dashboard.getPendingRequests.invalidate();
      toast({
        title: 'Saved',
        description: 'Jellyseerr configuration saved successfully',
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  const isSaving = useMinLoading(saveMutation.isPending);

  const deleteMutation = trpc.config.delete.useMutation({
    onSuccess: () => {
      void utils.config.get.invalidate();
      void utils.dashboard.getPendingRequests.invalidate();
      toast({
        title: 'Configuration Removed',
        description: 'Jellyseerr configuration has been removed',
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && config) {
      setUrl(config.url || '');
      setApiKey(config.apiKey || '');
      setUserId(config.userIdJellyseerr.toString() || '');
    } else if (!newOpen) {
      // Reset form when closing
      setUrl('');
      setApiKey('');
      setUserId('');
    }
  };

  const handleTest = () => {
    if (!url || !apiKey || !userId) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    testMutation.mutate({
      url: url.trim(),
      apiKey: apiKey.trim(),
    });
  };

  const handleSave = () => {
    if (!url || !apiKey || !userId) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    saveMutation.mutate({
      url: url.trim(),
      apiKey: apiKey.trim(),
      userIdJellyseerr: parseInt(userId),
    });
  };

  const handleRemove = () => {
    deleteMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} modal={false}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={config ? 'relative pl-8' : ''}>
          {config ? (
            <>
              <span className="absolute top-1/2 left-3 flex h-2 w-2 -translate-y-1/2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              Jellyseerr
            </>
          ) : (
            <>
              <Settings className="h-4 w-4" />
              Configure Jellyseerr
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Jellyseerr Configuration</DialogTitle>
          <DialogDescription>
            {config
              ? 'Update your Jellyseerr instance configuration.'
              : 'Configure your Jellyseerr instance to enable automatic media requests.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="url">Jellyseerr URL</Label>
            <Input
              id="url"
              placeholder="https://jellyseerr.example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              type="number"
              placeholder="1"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          {config && (
            <Button
              variant="destructive"
              onClick={handleRemove}
              loading={deleteMutation.isPending}
              className="w-full sm:mr-auto sm:w-auto"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          )}
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              variant="outline"
              onClick={handleTest}
              loading={testMutation.isPending}
              className="w-full sm:w-auto"
            >
              Test Connection
            </Button>
            <Button onClick={handleSave} loading={isSaving} className="w-full sm:w-auto">
              Save Configuration
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
