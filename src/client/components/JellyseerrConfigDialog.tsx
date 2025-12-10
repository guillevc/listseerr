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
      utils.config.get.invalidate();
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

  const deleteMutation = trpc.config.delete.useMutation({
    onSuccess: () => {
      utils.config.get.invalidate();
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

  const handleTest = async () => {
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
        <Button
          variant="outline"
          size="sm"
          className={config ? "relative pl-8" : ""}
        >
          {config ? (
            <>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
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
              disabled={deleteMutation.isPending}
              className="w-full sm:w-auto sm:mr-auto"
            >
              <Trash2 className="h-4 w-4" />
              {deleteMutation.isPending ? 'Removing...' : 'Remove'}
            </Button>
          )}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={testMutation.isPending}
              className="w-full sm:w-auto"
            >
              {testMutation.isPending ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="w-full sm:w-auto"
            >
              {saveMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
