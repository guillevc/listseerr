import { useState, useEffect } from 'react';
import { Trash2, Eye, EyeOff } from 'lucide-react';
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
  const [showApiKey, setShowApiKey] = useState(false);
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

  // Load config when it changes - syncing with external API data
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
        <h3 className="text-lg font-semibold">Jellyseerr Configuration</h3>
        <p className="text-sm text-muted mt-1">
          Configure your Jellyseerr instance to enable automatic media requests.
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
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
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? 'text' : 'password'}
              placeholder="Your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
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
