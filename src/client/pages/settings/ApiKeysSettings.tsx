import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { trpc } from '../../lib/trpc';
import { useToast } from '../../hooks/use-toast';

export function ApiKeysSettings() {
  // Trakt.tv state
  const [traktClientId, setTraktClientId] = useState('');
  const [isTraktEditing, setIsTraktEditing] = useState(false);
  const { toast } = useToast();

  // TMDB state (placeholder for future)
  const [tmdbApiKey, setTmdbApiKey] = useState('');
  const [showTmdbKey, setShowTmdbKey] = useState(false);
  const [isTmdbEditing, setIsTmdbEditing] = useState(false);

  // Load Trakt config
  const { data: traktConfig, isLoading: isTraktLoading, refetch: refetchTraktConfig } =
    trpc.providerConfig.getTraktConfig.useQuery();

  const hasSavedTraktKeys = !!traktConfig?.clientId;
  const hasSavedTmdbKey = false; // TODO: Implement TMDB later

  // Load existing config on mount
  useEffect(() => {
    if (traktConfig?.clientId) {
      setTraktClientId(traktConfig.clientId);
    }
  }, [traktConfig]);

  // Mutations
  const saveTraktMutation = trpc.providerConfig.setTraktConfig.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Trakt.tv Client ID saved successfully',
      });
      setIsTraktEditing(false);
      refetchTraktConfig();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save Trakt.tv Client ID',
        variant: 'destructive',
      });
    },
  });

  const deleteTraktMutation = trpc.providerConfig.deleteTraktConfig.useMutation({
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Trakt.tv Client ID removed successfully',
      });
      setTraktClientId('');
      setIsTraktEditing(false);
      refetchTraktConfig();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove Trakt.tv Client ID',
        variant: 'destructive',
      });
    },
  });

  // Trakt.tv handlers
  const handleTraktSave = () => {
    if (!traktClientId.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Client ID is required',
        variant: 'destructive',
      });
      return;
    }
    saveTraktMutation.mutate({ clientId: traktClientId.trim() });
  };

  const handleTraktEdit = () => {
    setIsTraktEditing(true);
  };

  const handleTraktCancel = () => {
    setIsTraktEditing(false);
    // Restore original value
    if (traktConfig?.clientId) {
      setTraktClientId(traktConfig.clientId);
    } else {
      setTraktClientId('');
    }
  };

  const handleTraktRemove = () => {
    if (confirm('Are you sure you want to remove the Trakt.tv Client ID?')) {
      deleteTraktMutation.mutate();
    }
  };

  // TMDB handlers
  const handleTmdbSave = () => {
    // TODO: Connect to backend API
    console.log('Saving TMDB API key:', { tmdbApiKey });
    setIsTmdbEditing(false);
  };

  const handleTmdbEdit = () => {
    setIsTmdbEditing(true);
  };

  const handleTmdbCancel = () => {
    setIsTmdbEditing(false);
    setTmdbApiKey('');
  };

  const handleTmdbRemove = () => {
    // TODO: Connect to backend API
    console.log('Removing TMDB API key');
    setTmdbApiKey('');
    setIsTmdbEditing(false);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Trakt.tv</CardTitle>
              {isTraktLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {hasSavedTraktKeys && !isTraktEditing && !isTraktLoading && (
                <Badge variant="secondary" className="text-xs">
                  Configured
                </Badge>
              )}
            </div>
            {hasSavedTraktKeys && !isTraktEditing && !isTraktLoading && (
              <Button variant="outline" size="sm" onClick={handleTraktEdit}>
                Edit
              </Button>
            )}
          </div>
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
          {(!hasSavedTraktKeys || isTraktEditing) && !isTraktLoading && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="trakt-client-id">Client ID</Label>
                <Input
                  id="trakt-client-id"
                  placeholder="Your Trakt.tv Client ID"
                  value={traktClientId}
                  onChange={(e) => setTraktClientId(e.target.value)}
                  disabled={saveTraktMutation.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  Only the Client ID is required for reading public lists
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleTraktSave}
                  disabled={saveTraktMutation.isPending || !traktClientId.trim()}
                >
                  {saveTraktMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {hasSavedTraktKeys ? 'Update Client ID' : 'Save Client ID'}
                </Button>
                {isTraktEditing && (
                  <Button
                    variant="outline"
                    onClick={handleTraktCancel}
                    disabled={saveTraktMutation.isPending}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </>
          )}

          {hasSavedTraktKeys && !isTraktEditing && !isTraktLoading && (
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                Client ID is configured and secure
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleTraktRemove}
                disabled={deleteTraktMutation.isPending}
              >
                {deleteTraktMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Remove
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* TMDB API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">TMDB</CardTitle>
              {hasSavedTmdbKey && !isTmdbEditing && (
                <Badge variant="secondary" className="text-xs">
                  Configured
                </Badge>
              )}
            </div>
            {hasSavedTmdbKey && !isTmdbEditing && (
              <Button variant="outline" size="sm" onClick={handleTmdbEdit}>
                Edit
              </Button>
            )}
          </div>
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
          {(!hasSavedTmdbKey || isTmdbEditing) && (
            <>
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

              <div className="flex gap-2 pt-2">
                <Button onClick={handleTmdbSave}>
                  {hasSavedTmdbKey ? 'Update Key' : 'Save Key'}
                </Button>
                {isTmdbEditing && (
                  <Button variant="outline" onClick={handleTmdbCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </>
          )}

          {hasSavedTmdbKey && !isTmdbEditing && (
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                API key is configured and secure
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleTmdbRemove}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </div>
          )}
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
