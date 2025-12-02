import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { useToast } from '../../hooks/use-toast';
import { trpc } from '../../lib/trpc';

export function JellyseerrSettings() {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [userId, setUserId] = useState('');
  const { toast } = useToast();

  const utils = trpc.useUtils();
  const { data: config } = trpc.config.get.useQuery();

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
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Load config when it changes
  useEffect(() => {
    if (config) {
      setUrl(config.url || '');
      setApiKey(config.apiKey || '');
      setUserId(config.userIdJellyseerr.toString() || '');
    }
  }, [config]);

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
      userIdJellyseerr: parseInt(userId),
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Jellyseerr Configuration</h2>
        <p className="text-muted-foreground mt-1">
          Configure your Jellyseerr instance to enable automatic media requests.
        </p>
      </div>

      <Separator />

      <div className="space-y-4 max-w-2xl">
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

        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleTest}
            disabled={testMutation.isPending}
          >
            {testMutation.isPending ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>

        {config && (
          <>
            <Separator />
            <div>
              <Button
                variant="destructive"
                onClick={handleRemove}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteMutation.isPending ? 'Removing...' : 'Remove Configuration'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
