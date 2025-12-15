import { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { ExternalLink } from '../../components/ui/external-link';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Switch } from '../../components/ui/switch';
import { trpc } from '../../lib/trpc';
import { useToast } from '../../hooks/use-toast';
import { useMinLoading } from '../../hooks/use-min-loading';

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

  const isSavingTrakt = useMinLoading(saveTraktMutation.isPending || deleteTraktMutation.isPending);
  const isSavingMdbList = useMinLoading(
    saveMdbListMutation.isPending || deleteMdbListMutation.isPending
  );

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
        <p className="mt-1 text-sm text-muted">Manage API keys for third-party services</p>
      </div>

      <Separator />

      {/* Trakt.tv API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Switch
              className="mt-1"
              checked={traktEnabled}
              onCheckedChange={handleTraktToggle}
              disabled={saveTraktMutation.isPending || deleteTraktMutation.isPending}
            />
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                Trakt
                {traktEnabled && traktConfig?.clientId && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </CardTitle>
              <CardDescription>
                Required for fetching Trakt lists and curated charts. Get your Client ID from{' '}
                <ExternalLink href="https://trakt.tv/oauth/applications">
                  Trakt.tv API Applications
                </ExternalLink>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!traktEnabled && (
            <Card variant="warning">
              <CardContent className="flex items-center gap-2 py-3">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">
                  Provider disabled - Trakt lists and charts cannot be processed.
                </p>
              </CardContent>
            </Card>
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
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
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
              loading={isSavingTrakt}
              disabled={traktEnabled && !traktClientId.trim()}
            >
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* MDBList API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Switch
              className="mt-1"
              checked={mdbListEnabled}
              onCheckedChange={handleMdbListToggle}
              disabled={saveMdbListMutation.isPending || deleteMdbListMutation.isPending}
            />
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                MDBList
                {mdbListEnabled && mdbListConfig?.apiKey && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </CardTitle>
              <CardDescription>
                Required for fetching MDBList lists. Get your API key from{' '}
                <ExternalLink href="https://mdblist.com/preferences/">
                  MDBList Preferences
                </ExternalLink>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!mdbListEnabled && (
            <Card variant="warning">
              <CardContent className="flex items-center gap-2 py-3">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">Provider disabled - MDBList lists cannot be processed.</p>
              </CardContent>
            </Card>
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
                <div className="absolute top-1/2 right-3 -translate-y-1/2">
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
              loading={isSavingMdbList}
              disabled={mdbListEnabled && !mdbListApiKey.trim()}
            >
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Future API Keys can be added here */}
      <Card className="border-dashed">
        <CardContent className="py-8">
          <div className="text-center text-muted">
            <Plus className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">More API integrations coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
