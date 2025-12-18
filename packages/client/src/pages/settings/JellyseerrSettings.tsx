import { useState, useEffect } from 'react';
import { Trash2, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { useToast } from '../../hooks/use-toast';
import { useMinLoading } from '../../hooks/use-min-loading';
import { trpc } from '../../lib/trpc';
import {
  jellyseerrConfigSchema,
  jellyseerrTestConnectionSchema,
} from 'shared/presentation/schemas/jellyseerr.schema';

export function JellyseerrSettings() {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [userId, setUserId] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  const utils = trpc.useUtils();
  const { data: configData } = trpc.config.get.useQuery();
  const config = configData?.config;

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
  const isSaving = useMinLoading(saveMutation.isPending);

  const deleteMutation = trpc.config.delete.useMutation({
    onSuccess: () => {
      void utils.config.get.invalidate();
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

  const handleTest = () => {
    // Validate test connection params using shared schema
    const result = jellyseerrTestConnectionSchema.safeParse({ url, apiKey });
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      toast({
        title: 'Validation Error',
        description: firstIssue?.message ?? 'Invalid configuration',
        variant: 'destructive',
      });
      return;
    }

    testMutation.mutate({
      url: result.data.url,
      apiKey: result.data.apiKey,
    });
  };

  const handleSave = () => {
    // Validate full config using shared schema
    const result = jellyseerrConfigSchema.safeParse({
      url,
      apiKey,
      userIdJellyseerr: parseInt(userId) || 0,
    });
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      toast({
        title: 'Validation Error',
        description: firstIssue?.message ?? 'Invalid configuration',
        variant: 'destructive',
      });
      return;
    }

    saveMutation.mutate({
      url: result.data.url,
      apiKey: result.data.apiKey,
      userIdJellyseerr: result.data.userIdJellyseerr,
    });
  };

  const handleRemove = () => {
    deleteMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Jellyseerr Configuration</h3>
        <p className="mt-1 text-sm text-muted">
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
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-foreground"
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
          <Button variant="outline" onClick={handleTest} loading={testMutation.isPending}>
            Test Connection
          </Button>
          <Button onClick={handleSave} loading={isSaving}>
            Save Configuration
          </Button>
        </div>

        {config && (
          <>
            <Separator />
            <div>
              <Button
                variant="destructive"
                onClick={handleRemove}
                loading={deleteMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Configuration
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
