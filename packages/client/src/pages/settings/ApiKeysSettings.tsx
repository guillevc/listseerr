import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { ExternalLink } from '../../components/ui/external-link';
import { PasswordInput } from '../../components/ui/password-input';
import { Label } from '../../components/ui/label';
import { Separator } from '../../components/ui/separator';
import { Switch } from '../../components/ui/switch';
import { trpc } from '../../lib/trpc';
import { useToast } from '../../hooks/use-toast';
import { useMinLoading } from '../../hooks/use-min-loading';
import { traktClientIdSchema } from 'shared/presentation/schemas';
import { mdblistApiKeySchema } from 'shared/presentation/schemas';

export function ApiKeysSettings() {
  // Trakt.tv state
  const [traktClientId, setTraktClientId] = useState('');
  const [traktEnabled, setTraktEnabled] = useState(false);
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // MDBList state
  const [mdbListApiKey, setMdbListApiKey] = useState('');
  const [mdbListEnabled, setMdbListEnabled] = useState(false);

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
      setMdbListApiKey(mdbListConfig.apiKey);
      setMdbListEnabled(true);
    } else {
      setMdbListEnabled(false);
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
      setMdbListApiKey('');
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

    // Validate Client ID using shared schema
    const result = traktClientIdSchema.safeParse(traktClientId);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      toast({
        title: 'Validation Error',
        description: firstIssue?.message ?? 'Invalid Client ID',
        variant: 'destructive',
      });
      return;
    }
    saveTraktMutation.mutate({
      clientId: result.data, // Use validated & trimmed value
    });
  };

  // MDBList handlers
  const handleMdbListToggle = (checked: boolean) => {
    // Just toggle the state, don't delete immediately
    setMdbListEnabled(checked);
  };

  const handleMdbListSave = () => {
    if (!mdbListEnabled) {
      // Provider is disabled, delete the config
      if (mdbListConfig?.apiKey) {
        deleteMdbListMutation.mutate();
      }
      return;
    }

    // Validate API Key using shared schema
    const result = mdblistApiKeySchema.safeParse(mdbListApiKey);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      toast({
        title: 'Validation Error',
        description: firstIssue?.message ?? 'Invalid API Key',
        variant: 'destructive',
      });
      return;
    }
    saveMdbListMutation.mutate({
      apiKey: result.data, // Use validated & trimmed value
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
                Fetch Trakt lists and charts. Get your Client ID from{' '}
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
                <p className="text-sm">Disabled — Trakt lists won't be processed.</p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-2">
            <Label htmlFor="trakt-client-id">Client ID</Label>
            <PasswordInput
              id="trakt-client-id"
              placeholder="Your Trakt.tv Client ID"
              value={traktClientId}
              onChange={(e) => setTraktClientId(e.target.value)}
              disabled={
                !traktEnabled || saveTraktMutation.isPending || deleteTraktMutation.isPending
              }
              showToggle={traktEnabled}
            />
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
                Fetch MDBList lists. Get your API key from{' '}
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
                <p className="text-sm">Disabled — MDBList lists won't be processed.</p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-2">
            <Label htmlFor="mdblist-api-key">API Key</Label>
            <PasswordInput
              id="mdblist-api-key"
              placeholder="Your MDBList API Key"
              value={mdbListApiKey}
              onChange={(e) => setMdbListApiKey(e.target.value)}
              disabled={
                !mdbListEnabled || saveMdbListMutation.isPending || deleteMdbListMutation.isPending
              }
              showToggle={mdbListEnabled}
            />
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
            <p className="text-sm">More integrations coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
