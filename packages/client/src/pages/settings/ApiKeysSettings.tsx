import { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Switch } from '../../components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { trpc } from '../../lib/trpc';
import { useToast } from '../../hooks/use-toast';

export function ApiKeysSettings() {
  // Trakt.tv state
  const [traktClientId, setTraktClientId] = useState('');
  const [traktEnabled, setTraktEnabled] = useState(false);
  const [showTraktKey, setShowTraktKey] = useState(false);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // MDBList state
  const [mdbListApiKey, setTmdbApiKey] = useState('');
  const [mdbListEnabled, setTmdbEnabled] = useState(false);
  const [showMdbListKey, setShowTmdbKey] = useState(false);

  // Load Trakt config
  const { data: traktData } = trpc.traktConfig.get.useQuery();
  const traktConfig = traktData?.config;

  // Load MDBList config
  const { data: mdbListData } = trpc.mdblistConfig.get.useQuery();
  const mdbListConfig = mdbListData?.config;

  // Load existing configs on mount - syncing with external API data
  useEffect(() => {
    if (traktConfig?.clientId) {
      setTraktClientId(traktConfig.clientId);
      setTraktEnabled(true);
    } else {
      setTraktEnabled(false);
    }
  }, [traktConfig]);

  useEffect(() => {
    if (mdbListConfig?.apiKey) {
      setTmdbApiKey(mdbListConfig.apiKey);
      setTmdbEnabled(true);
    } else {
      setTmdbEnabled(false);
    }
  }, [mdbListConfig]);

  // Mutations
  const saveTraktMutation = trpc.traktConfig.save.useMutation({
    onSuccess: () => {
      void utils.traktConfig.get.invalidate();
      toast({
        title: 'Success',
        description: 'Trakt Client ID saved successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save Trakt Client ID',
        variant: 'destructive',
      });
    },
  });

  const deleteTraktMutation = trpc.traktConfig.delete.useMutation({
    onSuccess: () => {
      void utils.traktConfig.get.invalidate();
      setTraktClientId('');
      toast({
        title: 'Success',
        description: 'Trakt Client ID removed',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove Trakt Client ID',
        variant: 'destructive',
      });
    },
  });

  const saveMdbListMutation = trpc.mdblistConfig.save.useMutation({
    onSuccess: () => {
      void utils.mdblistConfig.get.invalidate();
      toast({
        title: 'Success',
        description: 'MDBList API Key saved successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save MDBList API Key',
        variant: 'destructive',
      });
    },
  });

  const deleteMdbListMutation = trpc.mdblistConfig.delete.useMutation({
    onSuccess: () => {
      void utils.mdblistConfig.get.invalidate();
      setTmdbApiKey('');
      toast({
        title: 'Success',
        description: 'MDBList API Key removed',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove MDBList API Key',
        variant: 'destructive',
      });
    },
  });

  // Trakt handlers
  const handleTraktToggle = (checked: boolean) => {
    // Just toggle the state, don't delete immediately
    setTraktEnabled(checked);
  };

  const handleTraktSave = () => {
    if (!traktEnabled) {
      // Provider is disabled, delete the config
      if (traktConfig?.clientId) {
        deleteTraktMutation.mutate();
      }
      return;
    }

    // Provider is enabled, save the config
    if (!traktClientId.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Client ID cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    saveTraktMutation.mutate({
      clientId: traktClientId.trim(),
    });
  };

  // MDBList handlers
  const handleMdbListToggle = (checked: boolean) => {
    // Just toggle the state, don't delete immediately
    setTmdbEnabled(checked);
  };

  const handleMdbListSave = () => {
    if (!mdbListEnabled) {
      // Provider is disabled, delete the config
      if (mdbListConfig?.apiKey) {
        deleteMdbListMutation.mutate();
      }
      return;
    }

    // Provider is enabled, save the config
    if (!mdbListApiKey.trim()) {
      toast({
        title: 'Validation Error',
        description: 'API Key cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    saveMdbListMutation.mutate({
      apiKey: mdbListApiKey.trim(),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">API Keys</h3>
        <p className="text-sm text-muted mt-1">Manage API keys for third-party services</p>
      </div>

      <Separator />

      {/* Trakt.tv API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Trakt
                {traktEnabled && traktConfig?.clientId && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </CardTitle>
              <CardDescription>
                Required for syncing Trakt lists and curated charts. Get your Client ID from{' '}
                <a
                  href="https://trakt.tv/oauth/applications"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Trakt.tv API Applications
                </a>
              </CardDescription>
            </div>
            <Switch
              checked={traktEnabled}
              onCheckedChange={handleTraktToggle}
              disabled={saveTraktMutation.isPending || deleteTraktMutation.isPending}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!traktEnabled && (
            <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-md p-3">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Provider disabled - Trakt lists and charts cannot be processed. Enable to configure
                API key.
              </p>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="trakt-client-id">Client ID</Label>
            <div className="relative">
              <Input
                id="trakt-client-id"
                type={showTraktKey ? 'text' : 'password'}
                placeholder="Your Trakt.tv Client ID"
                value={traktClientId}
                onChange={(e) => setTraktClientId(e.target.value)}
                disabled={
                  !traktEnabled || saveTraktMutation.isPending || deleteTraktMutation.isPending
                }
                className="pr-10"
              />
              {traktEnabled && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <button
                    type="button"
                    onClick={() => setShowTraktKey(!showTraktKey)}
                    className="text-muted hover:text-foreground"
                  >
                    {showTraktKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted">
              Only the Client ID is required for reading public lists
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleTraktSave}
              disabled={
                saveTraktMutation.isPending ||
                deleteTraktMutation.isPending ||
                (traktEnabled && !traktClientId.trim())
              }
            >
              {saveTraktMutation.isPending || deleteTraktMutation.isPending
                ? 'Saving...'
                : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* MDBList API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                MDBList
                {mdbListEnabled && mdbListConfig?.apiKey && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </CardTitle>
              <CardDescription>
                Required for syncing MDBList lists. Get your API key from{' '}
                <a
                  href="https://mdblist.com/preferences/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  MDBList Preferences
                </a>
              </CardDescription>
            </div>
            <Switch
              checked={mdbListEnabled}
              onCheckedChange={handleMdbListToggle}
              disabled={saveMdbListMutation.isPending || deleteMdbListMutation.isPending}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!mdbListEnabled && (
            <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-md p-3">
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Provider disabled - MDBList lists cannot be processed. Enable to configure API key.
              </p>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="tmdb-api-key">API Key</Label>
            <div className="relative">
              <Input
                id="tmdb-api-key"
                type={showMdbListKey ? 'text' : 'password'}
                placeholder="Your MDBList API Key"
                value={mdbListApiKey}
                onChange={(e) => setTmdbApiKey(e.target.value)}
                disabled={
                  !mdbListEnabled ||
                  saveMdbListMutation.isPending ||
                  deleteMdbListMutation.isPending
                }
                className="pr-10"
              />
              {mdbListEnabled && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <button
                    type="button"
                    onClick={() => setShowTmdbKey(!showMdbListKey)}
                    className="text-muted hover:text-foreground"
                  >
                    {showMdbListKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleMdbListSave}
              disabled={
                saveMdbListMutation.isPending ||
                deleteMdbListMutation.isPending ||
                (mdbListEnabled && !mdbListApiKey.trim())
              }
            >
              {saveMdbListMutation.isPending || deleteMdbListMutation.isPending
                ? 'Saving...'
                : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Future API Keys can be added here */}
      <Card className="border-dashed">
        <CardContent className="py-8">
          <div className="text-center text-muted">
            <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">More API integrations coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
