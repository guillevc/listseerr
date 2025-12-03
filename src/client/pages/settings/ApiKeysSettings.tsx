import { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { trpc } from '../../lib/trpc';
import { useToast } from '../../hooks/use-toast';

export function ApiKeysSettings() {
  // Trakt.tv state
  const [traktClientId, setTraktClientId] = useState('');
  const [showTraktKey, setShowTraktKey] = useState(false);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // TMDB state (placeholder for future)
  const [tmdbApiKey, setTmdbApiKey] = useState('');
  const [showTmdbKey, setShowTmdbKey] = useState(false);

  // Load Trakt config
  const { data: traktConfig } = trpc.providerConfig.getTraktConfig.useQuery();

  // Load existing config on mount
  useEffect(() => {
    if (traktConfig?.clientId) {
      setTraktClientId(traktConfig.clientId);
    }
  }, [traktConfig]);

  // Mutations
  const saveTraktMutation = trpc.providerConfig.setTraktConfig.useMutation({
    onSuccess: () => {
      utils.providerConfig.getTraktConfig.invalidate();
      toast({
        title: 'Success',
        description: 'Trakt.tv Client ID saved successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save Trakt.tv Client ID',
        variant: 'destructive',
      });
    },
  });

  // Trakt.tv handlers
  const handleTraktSave = () => {
    saveTraktMutation.mutate({ clientId: traktClientId.trim() });
  };

  // TMDB handlers (placeholder)
  const handleTmdbSave = () => {
    // TODO: Connect to backend API
    toast({
      title: 'Info',
      description: 'TMDB integration coming soon',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">API Keys</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Manage API keys for third-party services
        </p>
      </div>

      <Separator />

      {/* Trakt.tv API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trakt.tv</CardTitle>
          <CardDescription>
            Required for syncing public Trakt.tv lists. Get your Client ID from{' '}
            <a
              href="https://trakt.tv/oauth/applications"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Trakt.tv API Applications
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="trakt-client-id">Client ID</Label>
            <div className="relative">
              <Input
                id="trakt-client-id"
                type={showTraktKey ? 'text' : 'password'}
                placeholder="Your Trakt.tv Client ID"
                value={traktClientId}
                onChange={(e) => setTraktClientId(e.target.value)}
                disabled={saveTraktMutation.isPending}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowTraktKey(!showTraktKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showTraktKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Only the Client ID is required for reading public lists
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleTraktSave}
              disabled={saveTraktMutation.isPending}
            >
              {saveTraktMutation.isPending ? 'Saving...' : 'Save Client ID'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TMDB API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">TMDB</CardTitle>
          <CardDescription>
            Required for fetching movie and TV show metadata. Get your API key from{' '}
            <a
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              TMDB API Settings
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="tmdb-api-key">API Key</Label>
            <div className="relative">
              <Input
                id="tmdb-api-key"
                type={showTmdbKey ? 'text' : 'password'}
                placeholder="Your TMDB API Key"
                value={tmdbApiKey}
                onChange={(e) => setTmdbApiKey(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowTmdbKey(!showTmdbKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showTmdbKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleTmdbSave}>
              Save API Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Future API Keys can be added here */}
      <Card className="border-dashed">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">More API integrations coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
